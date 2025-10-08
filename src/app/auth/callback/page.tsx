import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const AuthCallbackPage = async () => {
    const user = await currentUser();

    if (!user?.id || !user.emailAddresses[0].emailAddress) {
        return redirect("/auth/signin");
    }

    // Redirect authenticated users to the dashboard
    redirect("/app");
};

export default AuthCallbackPage
