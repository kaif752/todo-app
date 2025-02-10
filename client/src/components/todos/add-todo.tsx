import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTodoSchema, type InsertTodo } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function AddTodo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertTodo>({
    resolver: zodResolver(insertTodoSchema),
    defaultValues: {
      title: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTodo) => {
      const res = await apiRequest("POST", "/api/todos", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      form.reset();
      toast({
        title: "Todo added",
        description: "Your todo has been added successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add todo. Please try again.",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="flex gap-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Add a new todo..."
                  {...field}
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </form>
    </Form>
  );
}
