const FAQS = [
  {
    question: "How do I track my order?",
    answer:
      "Go to My Orders while signed in to see every order's delivery status and estimated delivery date.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Cash on Delivery is available now. Online payment is planned but not live yet.",
  },
  {
    question: "Can I change or cancel an order after placing it?",
    answer:
      "Not yet through the app — email us using the form below with your order number and we'll help directly.",
  },
  {
    question: "Do I need an account to browse products?",
    answer:
      "No — the catalog and product pages are open to everyone. You only need an account to add items to your cart, check out, or leave a review.",
  },
  {
    question: "How do returns work?",
    answer:
      "Reach out through the contact form below with your order number and we'll walk you through the return process.",
  },
];

export function Faq() {
  return (
    <div className="flex flex-col gap-2">
      {FAQS.map(({ question, answer }) => (
        <details
          key={question}
          className="group rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
        >
          <summary className="cursor-pointer list-none text-sm font-medium text-zinc-900 marker:content-none dark:text-zinc-50">
            {question}
          </summary>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{answer}</p>
        </details>
      ))}
    </div>
  );
}
