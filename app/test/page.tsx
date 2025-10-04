import { Metadata } from "next";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { H2, P } from "@/components/ui/typography";
import { prisma } from "@/lib/prisma";
import TestPageClient from "./test-page-client";

const DISABLE_PRERENDER = process.env.DISABLE_PRERENDER === "true";

export const dynamic = DISABLE_PRERENDER ? "force-dynamic" : "auto";
export const revalidate = DISABLE_PRERENDER ? 0 : 3600;
export const dynamicParams = true;


export default async function TestPage() {

  const project = await prisma.project.findFirst({
    where: { slug :"openverse" },
    include: {
      rounds: { include: { investments: { include: { investor: true } } } },
    },
  });

  if (!project) {
    return (
      <Container className="py-8">
        <div className="text-center py-16">
          <H2>Project Not Found</H2>
          <P className="mt-4 mb-8">
            The project you're looking for doesn't exist or has been removed.
          </P>
          <Button asChild>
            <Link href="/projects">Browse All Projects</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <TestPageClient project={project} />;
    </>
  );
}
