import Todo from "~/components/Todo";

export function meta() {
  return [
    { title: "Todo" },
    { name: "description", content: "Todo list page" },
  ];
}

export default function todo() {
  return <Todo />;
}
