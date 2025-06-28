
import { memo } from 'react';
import  { Handle, Position} from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

const CustomNode = memo(({ data, selected }: NodeProps) => {
  const themeClass = data.className || 'bg-white border-gray-200 text-gray-900';
  
  return (
    <div className={`
      px-4 py-3 shadow-lg rounded-lg border-2 min-w-[120px] text-center transition-all duration-200
      ${themeClass}
      ${selected ? 'ring-2 ring-blue-200 border-blue-500' : 'hover:border-gray-300'}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 border-2 border-white shadow-sm"
        style={{ left: -6 }}
      />
      
      <div className="font-medium text-sm">
        {String(data.label)}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-green-500 border-2 border-white shadow-sm"
        style={{ right: -6 }}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;