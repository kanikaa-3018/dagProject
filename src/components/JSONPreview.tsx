import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Node, Edge } from '@xyflow/react';

interface JSONPreviewProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  embedded?: boolean;
}

const JSONPreview: React.FC<JSONPreviewProps> = ({ nodes, edges, onClose, embedded = false }) => {
  const dagData = {
    nodes: nodes.map(node => ({
      id: node.id,
      label: node.data.label,
      position: node.position,
      theme: node.data.theme || 'default'
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label || 'Edge'
    })),
    metadata: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      lastModified: new Date().toISOString()
    }
  };

  if (embedded) {
    return (
      <div className="h-full">
        <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto h-full font-mono">
          {JSON.stringify(dagData, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-3/4 bg-white flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">DAG JSON Structure</h3>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          <pre className="text-sm bg-gray-50 p-4 rounded-lg h-full overflow-auto font-mono">
            {JSON.stringify(dagData, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full bg-gray-800 text-white">
            Close Preview
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default JSONPreview;