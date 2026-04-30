import { LoginForm } from '@/features/auth/login-form';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* 背景图层：蓝色渐变 + 背景图 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(105deg, rgba(59,130,246,.1) 0%, rgba(96,165,250,.08) 50%, rgba(120,200,255,.05) 100%), url('/登录页面111.png')"
        }}
      />
      
      {/* 白色渐变叠层，从右到左 */}
      <div className="absolute inset-0 bg-gradient-to-l from-white/95 via-white/85 to-white/40" />
      
      {/* 底部浅蓝色渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-50/30" />
      
      {/* 内容区域：响应式布局 */}
      <section className="relative z-10 mx-auto flex min-h-screen items-center justify-center px-4 py-10 sm:px-5 sm:justify-end sm:pr-8 lg:pr-16">
        <div className="w-full max-w-sm sm:max-w-md">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}