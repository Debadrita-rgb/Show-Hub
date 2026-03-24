import * as AccordionPrimitive from "@radix-ui/react-accordion";

export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = AccordionPrimitive.Item;
export const AccordionTrigger = ({ children, ...props }) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger {...props}>
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
export const AccordionContent = AccordionPrimitive.Content;
