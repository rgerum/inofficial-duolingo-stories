import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Layout({ children }) {
  const session = await getServerSession(authOptions);

  if (session?.user?.admin) redirect("/editor");

  return <>{children}</>;
}
