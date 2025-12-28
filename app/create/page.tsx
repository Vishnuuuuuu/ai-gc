import {
  CreateChatButton,
  ModelSearchSelect,
  SelectedModelsBar,
} from "@/components/chat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CreateChatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New AI Group Chat</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select AI models to chat with. Choose multiple models for a group
            conversation.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Model Selection */}
          <div>
            <h3 className="font-medium mb-3">Select Models</h3>
            <ModelSearchSelect />
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
