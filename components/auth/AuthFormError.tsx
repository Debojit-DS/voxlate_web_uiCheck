export function AuthFormError({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-[10px] border border-danger bg-danger-tint px-4 py-3 text-[14px] text-danger">
      {message}
    </div>
  );
}
