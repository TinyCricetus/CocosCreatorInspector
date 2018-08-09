// Author: huzi(moustache)
// Date: 18-7-27 11:19
// Description: 此文件保存window.Connect，用于通讯。
export default function () {
  // 用于通讯结构构造
  window.Connect = {
    // 通讯类型定义
    msgType: {
      clickedNodeInfo: 4, // 出现节点被点击
      refleshInfo: 3, // 节点刷新信息
      nodeInfo: 2, // 节点信息
      nodeListInfo: 1, // 节点列表信息
      notSupport: 0, // 不支持的游戏
    },
    CustomType(obj) {
      // cc内部结构
      if (node.__classname__ && node.__classname__.substr(0, 3) == "cc.") {
        let type = node.__classname__.substr(3);
        let rtnObj = {};
        // 自定义类型
        if (window.Connect[type]) {
          return window.Connect(obj);
        }
        // 通过__props__获得key值
        for (let key of cc[type].__props__) {
          // 忽略私有变量和函数
          if (key[0] != "_" && typeof obj[key] != "function") {
            rtnObj[key] = CustomType(obj[key]);
          }
        }
        return rtnObj;
      } else if (obj instanceof Array) {
        // 数组类型
        let rtnObj = [];
        for (let item of obj) {
          rtnObj.push(CustomType(item));
        }
      } else {
        // 基本类型或者对象
        return obj;
      }
    },
    // 将颜色转换成16进制
    Color(color) {
      return color.toCSS();
    },
    // 树节点构造：只需要node中的其中一些属性
    TreeNode(node) {
      if (node instanceof cc.Node) {
        // 添加新节点
        if (!window.inspectorGameMemoryStorage[node.uuid]) {
          window.inspectorGameMemoryStorage[node.uuid] = node;
        }
        let rtnNode = {
          uuid: node.uuid,
          name: node.name,
          
          components: [], // 用来查找
          children: [],
        };

        if (!(node instanceof cc.Scene)) {
          rtnNode.activeInHierarchy = node.activeInHierarchy; // 用来添加删除线
        }

        return rtnNode;
      }
    },
    // 节点构造：构造自定义节点
    Node(node) {
      if (node instanceof cc.Node) {
        // 此处不需要添加新节点
        let rtnNode = {
          type: node.__classname__,
          uuid: node.uuid,
          name: node.name,
          x: node.x,
          y: node.y,
          childrenCount: node.childrenCount,
          children: [],
          width: node.width,
          height: node.height,
          color: window.Connect.Color(node.color),
          opacity: node.opacity,
          rotation: node.rotation,
          rotationX: node.rotationX,
          rotationY: node.rotationY,
          anchorX: node.anchorX,
          anchorY: node.anchorY,
          scaleX: node.scaleX,
          scaleY: node.scaleY,
          skewX: node.skewX,
          skewY: node.skewY,
        };
        // v1.4.0 scene没有active
        // scene没有activeInHierarchy
        if (!(node instanceof cc.Scene)) {
          rtnNode.active = node.active;
          rtnNode.activeInHierarchy = node.activeInHierarchy;
        }
        return rtnNode;
      }
    },
    // 组件构造：构造自定义组件。
    Component(com) {
      if (com instanceof cc.Component) {
        // 添加新组件
        if (!window.inspectorGameMemoryStorage[com.uuid]) {
          window.inspectorGameMemoryStorage[com.uuid] = com;
        }
        let filterCom = {
          type: com.__classname__,
          uuid: com.uuid,
          enabled: com.enabled,
          enabledInHierarchy: com.enabledInHierarchy,
        };
        // console.log("com:", com);
        // 过滤掉私有值和函数的值
        for (let key of Object.keys(com)) {
          let value = com[key];
          if (key[0] != "_" && typeof value != "function" && !(value instanceof Array)) {
            // console.log(key, value);
            // object节点无法通过post进行复制，因此在此处修改
            if (value instanceof cc.Object || value instanceof cc.Action) {
              filterCom[key] = {
                name: value.name,
                uuid: value.uuid,
              };
            } else {
              filterCom[key] = value;
            }
            // console.log(key, filterCom[key]);
          }
        }
        // console.log("filtercom:", filterCom);
        return filterCom;
      }
    },
  };
}