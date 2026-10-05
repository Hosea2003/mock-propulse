import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="flex-row space-y-2">
          <h1>Welcome to Mock Propulse</h1>
          <p className="text-muted-foreground">Signed in as {data?.claims.email}</p>
          <form action={signOut}>
            <Button type="submit" variant="secondary">Sign out</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
