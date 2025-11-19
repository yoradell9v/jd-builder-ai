import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserProvider, User } from "@/context/UserContext";

export default async function SavedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) redirect("/signin");

    const decoded = await verifyAccessToken(accessToken);
    if (!decoded) redirect("/signin");

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            createdAt: true,
        },
    });

    if (!user) redirect("/signin");

    const userData: User = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
    };

    return <UserProvider initialUser={userData}>{children}</UserProvider>;
}
