export default function PageHeader({ title }: { title: string }) {
  return (
    <div>
      <h1 className="m-4 mb-1 text-4xl">{title}</h1>
      <hr className="ml-4 max-w-12 h-1 bg-slate-500" />
    </div>
  );
}
