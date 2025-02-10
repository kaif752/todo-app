import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { insertTodoSchema, type Todo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Home() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(insertTodoSchema),
    defaultValues: {
      title: "",
      completed: false,
    },
  });

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; completed: boolean }) => {
      await apiRequest("POST", "/api/todos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      form.reset();
      toast({
        title: "Success",
        description: "Todo added successfully",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/todos/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
        <p className="text-muted-foreground">
          Keep track of your tasks and stay organized.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Add a new todo..."
                    {...field}
                    disabled={createMutation.isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        {todos.map((todo) => (
          <Card key={todo.id} className="p-4 flex items-center gap-4">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) =>
                toggleMutation.mutate({
                  id: todo.id,
                  completed: checked as boolean,
                })
              }
            />
            <span
              className={`flex-1 ${
                todo.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {todo.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(todo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}

        {todos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No todos yet. Add one above!
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
