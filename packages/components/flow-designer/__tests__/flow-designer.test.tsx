import {
  getPreviousNodes,
  isClassics,
  json2LogicFlowJson,
  logicFlowJsonToWarmFlow,
  setCommonStyle,
} from '../src/common/js/tool'

describe('FlowDesigner 工具函数', () => {
  it('isClassics 判断经典模式', () => {
    expect(isClassics('CLASSICS')).toBe(true)
    expect(isClassics('MIMIC')).toBe(false)
  })

  it('json2LogicFlowJson 转换空节点为 graphData', () => {
    const result = json2LogicFlowJson({ flowCode: 'F1', nodeList: [] })
    expect(result.flowCode).toBe('F1')
    expect(result.nodes).toEqual([])
    expect(result.edges).toEqual([])
  })

  it('json2LogicFlowJson 转换节点坐标与类型', () => {
    const definition = {
      flowCode: 'F1',
      nodeList: [
        { nodeCode: 'n1', nodeType: 0, nodeName: '开始', coordinate: '100,200', nodeRatio: '1', ext: '[]' },
      ],
    }
    const result = json2LogicFlowJson(definition)
    expect(result.nodes).toHaveLength(1)
    const node = result.nodes[0]
    expect(node.id).toBe('n1')
    expect(node.type).toBe('start')
    expect(node.x).toBe(100)
    expect(node.y).toBe(200)
    expect(node.text.value).toBe('开始')
  })

  it('json2LogicFlowJson 转换边数据', () => {
    const definition = {
      flowCode: 'F1',
      nodeList: [
        { nodeCode: 'n1', nodeType: 0, nodeName: '开始', nodeRatio: '1', skipList: [
          { id: 'e1', nowNodeCode: 'n1', nextNodeCode: 'n2', skipName: '通过', skipType: 'PASS', skipCondition: '1', coordinate: '100,100;200,200' },
        ] },
        { nodeCode: 'n2', nodeType: 2, nodeName: '结束', nodeRatio: '1' },
      ],
    }
    const result = json2LogicFlowJson(definition)
    expect(result.edges).toHaveLength(1)
    const edge = result.edges[0]
    expect(edge.sourceNodeId).toBe('n1')
    expect(edge.targetNodeId).toBe('n2')
    expect(edge.type).toBe('skip')
    expect(edge.pointsList).toHaveLength(2)
  })

  it('getPreviousNodes 返回前置节点', () => {
    const nodes = [
      { id: 'n1' },
      { id: 'n2' },
      { id: 'n3' },
    ]
    const skips = [
      { properties: { skipType: 'PASS' }, sourceNodeId: 'n1', targetNodeId: 'n2' },
      { properties: { skipType: 'PASS' }, sourceNodeId: 'n2', targetNodeId: 'n3' },
      { properties: { skipType: 'REJECT' }, sourceNodeId: 'n1', targetNodeId: 'n3' },
    ]
    const previous = getPreviousNodes(nodes, skips, 'n3')
    // n1 -> n2 -> n3，前置为 n1 和 n2
    expect(previous.map((n: any) => n.id)).toContain('n1')
    expect(previous.map((n: any) => n.id)).toContain('n2')
  })

  it('getPreviousNodes 无前置返回空数组', () => {
    const nodes = [{ id: 'n1' }]
    const skips: any[] = []
    expect(getPreviousNodes(nodes, skips, 'n1')).toEqual([])
  })

  it('setCommonStyle 为 mimic 类型设置透明描边', () => {
    const style = {}
    const result = setCommonStyle(style, {}, 'node', 'mimic')
    expect(result.stroke).toBe('transparent')
    expect(result.strokeWidth).toBe(0)
  })

  it('logicFlowJsonToWarmFlow 反序列化为 JSON 字符串', () => {
    const data = {
      id: 'd1',
      flowCode: 'F1',
      flowName: '流程',
      nodes: [
        { id: 'n1', type: 'start', text: { value: '开始', x: 100, y: 200 }, x: 100, y: 200, properties: { permissionFlag: '0', nodeRatio: '1', anyNodeSkip: false, listenerType: '1', listenerPath: '', formCustom: '', formPath: '', ext: {} } },
      ],
      edges: [],
    }
    const json = logicFlowJsonToWarmFlow(data as any)
    const parsed = JSON.parse(json)
    expect(parsed.nodeList).toHaveLength(1)
    // nodeType 由 NODE_TYPE_MAP 的 key 映射而来（数字 0 / 字符串 '0' 均可）
    expect(String(parsed.nodeList[0].nodeType)).toBe('0')
    expect(parsed.nodeList[0].nodeName).toBe('开始')
  })
})
