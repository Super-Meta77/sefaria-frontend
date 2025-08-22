import React, { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Example dialectic tree data structure
const sugyaTree = {
  id: "q1",
  type: "question",
  label: "What is the obligation of evening prayer?",
  sugyaLocation: "q1",
  children: [
    {
      id: "a1",
      type: "answer",
      label: "It is a rabbinic obligation.",
      sugyaLocation: "a1",
      children: [
        {
          id: "k1",
          type: "kasha",
          label: "But why is it treated as optional in some sources?",
          sugyaLocation: "k1",
          children: [
            {
              id: "t1",
              type: "terutz",
              label: "Because the Talmud records a dispute among the sages.",
              sugyaLocation: "t1",
              children: [
                {
                  id: "teiku1",
                  type: "teiku",
                  label: "The matter remains unresolved (teiku).",
                  sugyaLocation: "teiku1",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const typeColors = {
  question: "text-blue-800",
  answer: "text-green-700",
  kasha: "text-red-700",
  terutz: "text-yellow-700",
  teiku: "text-gray-500 italic",
};

function TreeNode({ node, onNodeClick, depth = 0 }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div
          className={`flex items-center cursor-pointer py-1 pl-${depth * 4} ${typeColors[node.type]}`}
          onClick={e => {
            e.stopPropagation();
            onNodeClick(node);
          }}
        >
          <span className="font-semibold mr-2">{node.label}</span>
          {hasChildren && (
            <span className="ml-2 text-xs text-gray-400">[{open ? "-" : "+"}]</span>
          )}
        </div>
      </CollapsibleTrigger>
      {hasChildren && (
        <CollapsibleContent>
          <div className="ml-4 border-l border-gray-200 pl-2">
            {node.children.map(child => (
              <TreeNode key={child.id} node={child} onNodeClick={onNodeClick} depth={depth + 1} />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export default function SugyaLogicTree({ onNodeClick }) {
  return (
    <Card className="bg-white border border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Dialectic Logic Tree</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-2">
        <TreeNode node={sugyaTree} onNodeClick={onNodeClick} />
      </CardContent>
    </Card>
  );
}

