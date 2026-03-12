import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import AgentChat from "./agent-chat";

const MovieAIAgent = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Movie AI Agent</DrawerTitle>
        </DrawerHeader>
        <section className="h-full max-h-[calc(100lvh-16lvh)]">
          <AgentChat />
        </section>
      </DrawerContent>
    </Drawer>
  );
};

export default MovieAIAgent;
