import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { MagnetRule, MagnetRules } from '../../types/rule';

const RuleList: React.FC = () => {
    const [rules, setRules] = useState<MagnetRules>([]);

    // 从 Chrome Storage 加载规则
    useEffect(() => {
        chrome.storage.local.get(['magnetRules'], (result) => {
            if (result.magnetRules) {
                setRules(result.magnetRules);
            }
        });
    }, []);

    // 保存规则到 Chrome Storage
    const saveRules = (newRules: MagnetRules) => {
        chrome.storage.local.set({ magnetRules: newRules });
        setRules(newRules);
    };

    // 添加新规则
    const addRule = () => {
        const newRule: MagnetRule = {
            id: Date.now().toString(),
            enabled: true,
            stopOnMatch: false,
            order: rules.length,
        };
        saveRules([...rules, newRule]);
    };

    // 删除规则
    const deleteRule = (id: string) => {
        const newRules = rules.filter(rule => rule.id !== id)
            .map((rule, index) => ({ ...rule, order: index }));
        saveRules(newRules);
    };

    // 切换规则启用状态
    const toggleRuleEnabled = (id: string) => {
        const newRules = rules.map(rule => 
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
        );
        saveRules(newRules);
    };

    // 切换匹配后中止状态
    const toggleStopOnMatch = (id: string) => {
        const newRules = rules.map(rule =>
            rule.id === id ? { ...rule, stopOnMatch: !rule.stopOnMatch } : rule
        );
        saveRules(newRules);
    };

    // 处理拖拽结束事件
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(rules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const newRules = items.map((rule, index) => ({
            ...rule,
            order: index
        }));
        saveRules(newRules);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">磁链保存规则</h2>
                <button
                    onClick={addRule}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    添加规则
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="rules">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                        >
                            {rules.map((rule, index) => (
                                <Draggable
                                    key={rule.id}
                                    draggableId={rule.id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow"
                                        >
                                            <div
                                                {...provided.dragHandleProps}
                                                className="cursor-move text-gray-400 hover:text-gray-600"
                                            >
                                                ⋮⋮
                                            </div>
                                            
                                            <input
                                                type="checkbox"
                                                checked={rule.enabled}
                                                onChange={() => toggleRuleEnabled(rule.id)}
                                                className="w-5 h-5"
                                            />
                                            
                                            <div className="flex-grow">
                                                规则开发中
                                            </div>

                                            <button
                                                onClick={() => toggleStopOnMatch(rule.id)}
                                                className={`px-3 py-1 rounded ${
                                                    rule.stopOnMatch
                                                        ? 'bg-yellow-500 text-white'
                                                        : 'bg-gray-200 text-gray-700'
                                                }`}
                                            >
                                                匹配后中止
                                            </button>

                                            <button
                                                onClick={() => deleteRule(rule.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {rules.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    暂无规则，点击"添加规则"按钮开始添加
                </div>
            )}
        </div>
    );
};

export default RuleList; 