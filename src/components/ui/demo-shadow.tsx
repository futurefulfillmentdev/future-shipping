import { EtheralShadow } from '@/components/ui/etheral-shadow';

export function DemoShadow() {
  return (
    <div className="flex w-full h-screen items-center justify-center">
      <EtheralShadow
        color="rgba(128,128,128,1)"
        animation={{ scale: 100, speed: 90 }}
        noise={{ opacity: 1, scale: 1.2 }}
        sizing="fill"
      />
    </div>
  );
} 