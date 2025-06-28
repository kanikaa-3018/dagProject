
import React from 'react';
import { X, TreePine, GitBranch, Workflow, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Node, Edge} from '@xyflow/react';
import { MarkerType } from '@xyflow/react';

interface PresetTemplatesProps {
  onClose: () => void;
  onLoadPreset: (nodes: Node[], edges: Edge[]) => void;
}

const PresetTemplates: React.FC<PresetTemplatesProps> = ({ onClose, onLoadPreset }) => {
  const presets = [
    {
      id: 'binary-tree',
      name: 'Binary Tree',
      icon: TreePine,
      description: 'A simple binary tree structure',
      nodes: [
        { id: 'root', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Root' } },
        { id: 'left', type: 'custom', position: { x: 150, y: 150 }, data: { label: 'Left Child' } },
        { id: 'right', type: 'custom', position: { x: 350, y: 150 }, data: { label: 'Right Child' } },
        { id: 'left-left', type: 'custom', position: { x: 100, y: 250 }, data: { label: 'Left-Left' } },
        { id: 'left-right', type: 'custom', position: { x: 200, y: 250 }, data: { label: 'Left-Right' } },
      ],
      edges: [
        { id: 'e1', source: 'root', target: 'left', label: 'left', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e2', source: 'root', target: 'right', label: 'right', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e3', source: 'left', target: 'left-left', label: 'left', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e4', source: 'left', target: 'left-right', label: 'right', markerEnd: { type: MarkerType.ArrowClosed } },
      ],
    },
    {
      id: 'linear-pipeline',
      name: 'Linear Pipeline',
      icon: Workflow,
      description: 'Sequential data processing pipeline',
      nodes: [
        { id: 'input', type: 'custom', position: { x: 50, y: 100 }, data: { label: 'Data Input' } },
        { id: 'validate', type: 'custom', position: { x: 200, y: 100 }, data: { label: 'Validate' } },
        { id: 'transform', type: 'custom', position: { x: 350, y: 100 }, data: { label: 'Transform' } },
        { id: 'process', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'Process' } },
        { id: 'output', type: 'custom', position: { x: 650, y: 100 }, data: { label: 'Output' } },
      ],
      edges: [
        { id: 'e1', source: 'input', target: 'validate', label: 'raw data', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e2', source: 'validate', target: 'transform', label: 'valid data', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e3', source: 'transform', target: 'process', label: 'clean data', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e4', source: 'process', target: 'output', label: 'result', markerEnd: { type: MarkerType.ArrowClosed } },
      ],
    },
    {
      id: 'branching-workflow',
      name: 'Branching Workflow',
      icon: GitBranch,
      description: 'Workflow with conditional branches',
      nodes: [
        { id: 'start', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Start' } },
        { id: 'decision', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Decision' } },
        { id: 'branch-a', type: 'custom', position: { x: 150, y: 250 }, data: { label: 'Branch A' } },
        { id: 'branch-b', type: 'custom', position: { x: 350, y: 250 }, data: { label: 'Branch B' } },
        { id: 'merge', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Merge' } },
        { id: 'end', type: 'custom', position: { x: 250, y: 450 }, data: { label: 'End' } },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'decision', label: 'input', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e2', source: 'decision', target: 'branch-a', label: 'condition A', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e3', source: 'decision', target: 'branch-b', label: 'condition B', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e4', source: 'branch-a', target: 'merge', label: 'result A', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e5', source: 'branch-b', target: 'merge', label: 'result B', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e6', source: 'merge', target: 'end', label: 'final', markerEnd: { type: MarkerType.ArrowClosed } },
      ],
    },
    {
      id: 'diamond-network',
      name: 'Diamond Network',
      icon: Network,
      description: 'Diamond-shaped dependency network',
      nodes: [
        { id: 'top', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Source' } },
        { id: 'left', type: 'custom', position: { x: 150, y: 150 }, data: { label: 'Process A' } },
        { id: 'right', type: 'custom', position: { x: 350, y: 150 }, data: { label: 'Process B' } },
        { id: 'bottom', type: 'custom', position: { x: 250, y: 250 }, data: { label: 'Combine' } },
      ],
      edges: [
        { id: 'e1', source: 'top', target: 'left', label: 'data A', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e2', source: 'top', target: 'right', label: 'data B', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e3', source: 'left', target: 'bottom', label: 'result A', markerEnd: { type: MarkerType.ArrowClosed } },
        { id: 'e4', source: 'right', target: 'bottom', label: 'result B', markerEnd: { type: MarkerType.ArrowClosed } },
      ],
    },
  ];

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] bg-white overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Load Preset DAG Structure</h3>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 overflow-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset) => {
              const IconComponent = preset.icon;
              return (
                <Card key={preset.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{preset.name}</h4>
                      <p className="text-xs text-gray-600 mb-3">{preset.description}</p>
                      <div className="text-xs text-gray-500 mb-3">
                        {preset.nodes.length} nodes, {preset.edges.length} edges
                      </div>
                      <Button 
                        onClick={() => onLoadPreset(preset.nodes, preset.edges)}
                        size="sm"
                        className="w-full bg-gray-900 text-white"
                      >
                        Load Template
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Select a preset to replace your current diagram. You can edit node labels and edge names after loading.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PresetTemplates;