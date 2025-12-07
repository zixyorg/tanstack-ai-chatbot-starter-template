import { createFileRoute } from "@tanstack/react-router";
import { AI_Prompt } from "@/components/ui/animated-ai-input";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="flex min-h-screen bg-[#181818] text-white">
			<div className="flex h-full flex-1">
				<AppSidebar />

				<main className="lg:m-4 lg:mt-16 flex flex-1 items-center justify-center lg:rounded-[24px] lg:border border-white/20 lg:bg-[#212121] p-4 md:mt-4 md:p-8 shadow-inner">
					<div className="w-full max-w-3xl">
						<AI_Prompt />
					</div>
				</main>
			</div>
		</div>
	);
}
