// The seed feature: proof the /ideas playground works.
export const metadata = { title: "Hello, World — Let's See What Happens" };

export default function HelloWorldPage() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <p className="text-6xl animate-bounce">👋</p>
      <h1 className="text-3xl font-bold tracking-tight">Hello, world.</h1>
      <p className="text-zinc-500 max-w-md">
        I am the seed feature — the only page on this site written by a human.
        Everything else that appears under /ideas was requested by a stranger
        and built by a robot.
      </p>
    </div>
  );
}
