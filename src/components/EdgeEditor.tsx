
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Edge } from '@xyflow/react';

interface EdgeEditorProps {
  edge: Edge;
  onClose: () => void;
  onUpdateLabel: (edgeId: string, newLabel: string) => void;
}

const EdgeEditor: React.FC<EdgeEditorProps> = ({ edge, onClose, onUpdateLabel }) => {
  const [label, setLabel] = useState(edge.label as string || '');

  const handleSave = () => {
    onUpdateLabel(edge.id, label);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Edge</h3>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>From:</strong> {edge.source}</p>
            <p><strong>To:</strong> {edge.target}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edge-label">Edge Label</Label>
            <Input
              id="edge-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter edge label..."
              autoFocus
            />
          </div>
        </div>
        
        <div className="p-4 border-t flex gap-2 justify-end">
          <Button onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EdgeEditor;