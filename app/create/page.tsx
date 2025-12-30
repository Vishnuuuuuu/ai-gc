import {
  CreateChatButton,
  EnhancedModelSelector,
  SelectedModelsBar,
} from "@/components/chat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CreateChatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Create New AI Group Chat</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select AI models to chat with. Hover over models to see details.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Model Selection */}
          <div>
            <h3 className="text-sm font-medium mb-2">Select Models</h3>
            <EnhancedModelSelector />
          </div>

          <Separator />

          {/* Selected Models Bar */}
          <SelectedModelsBar />

          {/* Create Button */}
          <div className="flex justify-end">
            <CreateChatButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
