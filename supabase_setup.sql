-- ==========================================
-- Supabase PostgreSQL 스키마 및 RLS 보안 설정
-- 실행 방법: Supabase Dashboard > SQL Editor > New Query 에 붙여넣고 Run 실행
-- ==========================================

-- ------------------------------------------
-- 1. 테이블 정의 및 기본키 설정
-- ------------------------------------------

-- 1.1 Profiles 테이블 (auth.users와 1:1 매칭)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Clients 테이블 (거래처 목록)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 Trips 테이블 (운행 일지)
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  fee NUMERIC NOT NULL DEFAULT 0,
  commission NUMERIC NOT NULL DEFAULT 0,
  distance NUMERIC NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  payment_date TEXT,
  payment_due_date TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  route_start TEXT,
  route_load TEXT,
  route_vias TEXT[] NOT NULL DEFAULT '{}',
  route_unload TEXT,
  route_arrival TEXT,
  notes TEXT,
  expenses JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.4 Expenses 테이블 (고정비/유동비 지출 목록)
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.5 Trackers 테이블 (스마트 운행기록기 실시간 상태 저장소)
CREATE TABLE IF NOT EXISTS public.trackers (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  step TEXT NOT NULL DEFAULT '0',
  start_time TEXT,
  via_complete_times JSONB NOT NULL DEFAULT '[]',
  via_times JSONB NOT NULL DEFAULT '[]',
  route_start TEXT,
  route_load TEXT,
  route_vias TEXT[] NOT NULL DEFAULT '{}',
  route_unload TEXT,
  route_arrival TEXT,
  distance NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.6 Settings 테이블 (사용자 개인 설정)
CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  owner_name TEXT,
  theme TEXT NOT NULL DEFAULT 'light',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------
-- 2. 트리거 및 권한 자동화 설계
-- ------------------------------------------

-- 회원가입 시 profile, settings, trackers 데이터를 강제 자동 생성 및 'user' 권한 부여하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Profiles 생성 (role: 'user' 강제 지정)
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'
  );
  
  -- 2. Settings 생성 (기본 테마 'light')
  INSERT INTO public.settings (user_id, owner_name, theme)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', '사용자'), 'light');
  
  -- 3. Trackers 생성 (기본 상태 '0'인 idle)
  INSERT INTO public.trackers (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth 회원 등록 트리거 바인딩
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------
-- 3. Row Level Security (RLS) 및 권한 검증 설정
-- ------------------------------------------

-- RLS 전면 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 어드민 여부 판별하는 공통 DB 헬퍼 함수
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3.1 Profiles RLS 정책
CREATE POLICY "본인 프로필 조회 또는 어드민 전체 프로필 조회 허용" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "본인 프로필 수정 또는 어드민 관리 허용" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (
    -- 일반 유저는 스스로 role 필드를 수정할 수 없음
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "어드민 권한의 프로필 강제 삭제 허용" ON public.profiles
  FOR DELETE USING (public.is_admin(auth.uid()));

-- 3.2 Clients RLS 정책
CREATE POLICY "Clients 소유자 또는 어드민 액세스 허용" ON public.clients
  FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3.3 Trips RLS 정책
CREATE POLICY "Trips 소유자 또는 어드민 액세스 허용" ON public.trips
  FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3.4 Expenses RLS 정책
CREATE POLICY "Expenses 소유자 또는 어드민 액세스 허용" ON public.expenses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3.5 Trackers RLS 정책
CREATE POLICY "Trackers 소유자 또는 어드민 액세스 허용" ON public.trackers
  FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3.6 Settings RLS 정책
CREATE POLICY "Settings 소유자 또는 어드민 액세스 허용" ON public.settings
  FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- ------------------------------------------
-- 4. 보안 함수 (Security Definer RPC) 정의
-- ------------------------------------------

-- 타 회원의 다른 중요 정보를 노출하지 않고, 오직 연체(미수금) 상태인 거래처 이름만 중복없이 반환하는 함수 (보안 조치)
CREATE OR REPLACE FUNCTION public.get_overdue_clients(today_str TEXT)
RETURNS TABLE (client_name TEXT) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT DISTINCT t.client_name 
  FROM public.trips t
  WHERE t.is_paid = false 
    AND t.payment_due_date IS NOT NULL 
    AND t.payment_due_date < today_str;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.get_overdue_clients(today_str TEXT) TO authenticated;
