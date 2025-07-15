import { SocialLinks } from "../../components/SocialLinks.tsx";
import { H1, H2 } from "../../components/Typography.tsx";
import Intro from "./intro.mdx";

export default function Home() {
  return (
    <>
      <H1>Hello.</H1>
      <H2>I build Software & Design.</H2>

      <main className="flex flex-col gap-6 text-xl mb-4">
        <Intro />
      </main>

      <SocialLinks />
    </>
  );
}
