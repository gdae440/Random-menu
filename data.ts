
import { Recipe } from './types';

export const RECIPES: Recipe[] = [
  // 牛肉类
  { id: 'b1', name: '日式牛排盖饭', ingredients: ['Ribeye牛排', '米饭', '大蒜', '黄油'], category: '牛肉类' },
  { id: 'b2', name: '青椒炒牛肉', ingredients: ['牛肉', '青椒'], category: '牛肉类' },
  { id: 'b3', name: '孜然洋葱炒牛肉', ingredients: ['牛肉', '洋葱', '孜然'], category: '牛肉类' },
  { id: 'b4', name: '黑椒玉米牛肉粒', ingredients: ['牛肉', '玉米', '黑胡椒'], category: '牛肉类' },
  { id: 'b5', name: '西红柿土豆炖牛肉', ingredients: ['牛肉', '西红柿', '土豆'], category: '牛肉类' },
  { id: 'b6', name: '小炒黄牛肉', ingredients: ['牛肉', '小米辣', '香菜'], category: '牛肉类' },
  { id: 'b7', name: '黑椒牛柳炒意面', ingredients: ['Flank牛肉', '意面', '黑胡椒', '红椒'], category: '牛肉类' },
  { id: 'b8', name: '红烧牛肉面', ingredients: ['牛腩', '面条', '豆瓣酱', '八角'], category: '牛肉类' },

  // 猪肉/排骨类
  { id: 'p1', name: '蒜香排骨[免油炸]', ingredients: ['排骨', '大蒜'], category: '猪肉/排骨类' },
  { id: 'p2', name: '炖排骨', ingredients: ['排骨', '葱姜'], category: '猪肉/排骨类' },
  { id: 'p3', name: '农家小炒肉', ingredients: ['五花肉', '青红椒'], category: '猪肉/排骨类' },
  { id: 'p4', name: '土豆炒肉', ingredients: ['土豆', '猪肉'], category: '猪肉/排骨类' },
  { id: 'p5', name: '糖醋里脊', ingredients: ['猪里脊', '番茄酱', '白醋'], category: '猪肉/排骨类' },
  { id: 'p6', name: '鱼香肉丝', ingredients: ['里脊肉', '木耳', '胡萝卜', '青椒'], category: '猪肉/排骨类' },

  // 鸡肉类
  { id: 'c1', name: '柠檬炒鸡肉', ingredients: ['鸡肉', '柠檬'], category: '鸡肉类' },
  { id: 'c2', name: '凉拌手撕鸡', ingredients: ['鸡腿', '辣椒油', '花生'], category: '鸡肉类' },
  { id: 'c3', name: '鸡公煲', ingredients: ['鸡肉', '洋葱', '芹菜'], category: '鸡肉类' },
  { id: 'c4', name: '宫保鸡丁', ingredients: ['鸡胸肉', '花生米', '干辣椒'], category: '鸡肉类' },
  { id: 'c5', name: '照烧鸡腿饭', ingredients: ['鸡腿', '米饭', '照烧汁'], category: '鸡肉类' },

  // 素菜/蛋/主食
  { id: 'v1', name: '醋溜白菜', ingredients: ['白菜', '醋', '干辣椒'], category: '素菜/蛋/主食' },
  { id: 'v2', name: '芹菜炒玉米粒', ingredients: ['芹菜', '玉米'], category: '素菜/蛋/主食' },
  { id: 'v3', name: '西葫芦炒蛋', ingredients: ['西葫芦', '鸡蛋'], category: '素菜/蛋/主食' },
  { id: 'v4', name: '西红柿炒鸡蛋', ingredients: ['西红柿', '鸡蛋'], category: '素菜/蛋/主食' },
  { id: 'v5', name: '干煸菜花', ingredients: ['菜花', '干辣椒'], category: '素菜/蛋/主食' },
  { id: 'v6', name: '蟹柳滑蛋薯饼汉堡', ingredients: ['蟹柳', '鸡蛋', '薯饼'], category: '素菜/蛋/主食' },
  { id: 'v7', name: '黄油煎蛋早餐', ingredients: ['鸡蛋', '黄油'], category: '素菜/蛋/主食' },
  { id: 'v8', name: '麻婆豆腐', ingredients: ['嫩豆腐', '肉末', '豆瓣酱'], category: '素菜/蛋/主食' },
  { id: 'v9', name: '地三鲜', ingredients: ['土豆', '茄子', '青椒'], category: '素菜/蛋/主食' },
];
