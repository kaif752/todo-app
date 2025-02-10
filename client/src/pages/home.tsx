import { AddTodo } from "@/components/todos/add-todo";
import { TodoList } from "@/components/todos/todo-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container max-w-2xl mx-auto p-4 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Todo List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AddTodo />
          <TodoList />
        </CardContent>
      </Card>
    </div>
  );
}
