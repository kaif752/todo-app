import { useQuery } from "@tanstack/react-query";
import type { Todo } from "@shared/schema";
import { TodoItem } from "./todo-item";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TodoList() {
  const { data: todos, isLoading, error } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load todos. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (!todos?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No todos yet. Add one above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
