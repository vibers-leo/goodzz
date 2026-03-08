"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./AdminComponents.module.css";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Search, Package, Check, X, Settings2, PlusCircle, MinusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Product, PRODUCT_CATEGORIES } from "@/lib/products";

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error("상품 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: Product | null = null) => {
    setSelectedProduct(product || {
      name: "",
      price: 0,
      category: "인쇄",
      thumbnail: "",
      stock: 100,
      isActive: true,
      description: "",
      tags: [],
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const isEdit = !!selectedProduct.id;
      const url = isEdit ? `/api/products/${selectedProduct.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProduct),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isEdit ? "상품이 수정되었습니다." : "상품이 등록되었습니다.");
        setIsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.error || "실패했습니다.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("삭제되었습니다.");
        fetchProducts();
      } else {
        toast.error(data.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("오류가 발생했습니다.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.componentContainer}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={styles.title}>상품 관리</h2>
          <p className={styles.desc}>전체 상품 리스트를 관리하고 신규 상품을 등록합니다.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> 상품 등록
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="상품명 또는 카테고리 검색"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이미지</th>
              <th>상품명</th>
              <th>카테고리</th>
              <th>가격</th>
              <th>재고</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={7} className="py-20 text-center text-gray-400">등록된 상품이 없습니다.</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="w-12 h-12 rounded border overflow-hidden bg-gray-50 relative">
                      <Image src={p.thumbnail} alt="" fill className="object-cover" unoptimized />
                    </div>
                  </td>
                  <td className="font-bold">{p.name}</td>
                  <td><span className="text-xs bg-gray-100 px-2 py-1 rounded">{p.category}</span></td>
                  <td>{p.price.toLocaleString()}원</td>
                  <td>{p.stock}개</td>
                  <td>
                    {p.isActive ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold"><Check size={12} /> 판매중</span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1 text-xs font-bold"><X size={12} /> 품절/숨김</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(p)} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-gray-100 rounded-lg text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className="text-xl font-bold">{selectedProduct.id ? "상품 수정" : "신규 상품 등록"}</h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalBody}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                  <input 
                    required type="text" 
                    className="w-full p-2 border rounded-lg"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={selectedProduct.category}
                    onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                  >
                    {Object.values(PRODUCT_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                  <input 
                    required type="number" 
                    className="w-full p-2 border rounded-lg"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({...selectedProduct, price: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">재고 수량</label>
                  <input 
                    required type="number" 
                    className="w-full p-2 border rounded-lg"
                    value={selectedProduct.stock}
                    onChange={(e) => setSelectedProduct({...selectedProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" checked={selectedProduct.isActive} 
                        onChange={() => setSelectedProduct({...selectedProduct, isActive: true})}
                      /> 판매가능
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" checked={!selectedProduct.isActive} 
                        onChange={() => setSelectedProduct({...selectedProduct, isActive: false})}
                      /> 품절/숨김
                    </label>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지 URL</label>
                  <input 
                    required type="text" 
                    className="w-full p-2 border rounded-lg"
                    placeholder="https://images.unsplash.com/..."
                    value={selectedProduct.thumbnail}
                    onChange={(e) => setSelectedProduct({...selectedProduct, thumbnail: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
                  <textarea 
                    className="w-full p-2 border rounded-lg h-24"
                    value={selectedProduct.description}
                    onChange={(e) => setSelectedProduct({...selectedProduct, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Automatic Estimation Options */}
              <div className="mt-8 border-t pt-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">자동 견적 옵션 설정</h4>
                    <p className="text-xs text-gray-500">와우프레스/마플샵 스타일의 동적 가격 산출 옵션</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                        const newGroup = {
                            id: Date.now().toString(),
                            name: `opt_${Date.now()}`,
                            label: "새 옵션 그룹",
                            type: 'select' as const,
                            values: [{ id: 'v1', label: '첫 번째 항목', priceAdded: 0, priceMultiplier: 1 }]
                        };
                        const currentGroups = selectedProduct.options?.groups || [];
                        setSelectedProduct({
                            ...selectedProduct,
                            options: { ...selectedProduct.options, groups: [...currentGroups, newGroup] }
                        });
                    }}
                    className="flex items-center gap-1 text-sm bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 transition-all"
                  >
                    <PlusCircle size={14} /> 그룹 추가
                  </button>
                </div>

                <div className="space-y-4">
                  {(selectedProduct.options?.groups || []).map((group, gIdx) => (
                    <div key={group.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2 flex-1">
                          <input 
                            className="bg-white border rounded px-2 py-1 text-sm font-bold w-1/3"
                            value={group.label}
                            placeholder="옵션명 (예: 종이 재질)"
                            onChange={(e) => {
                                const newGroups = [...(selectedProduct.options?.groups || [])];
                                newGroups[gIdx].label = e.target.value;
                                setSelectedProduct({...selectedProduct, options: {...selectedProduct.options, groups: newGroups}});
                            }}
                          />
                          <select 
                            className="bg-white border rounded px-2 py-1 text-xs"
                            value={group.type}
                            onChange={(e) => {
                                const newGroups = [...(selectedProduct.options?.groups || [])];
                                newGroups[gIdx].type = e.target.value as any;
                                setSelectedProduct({...selectedProduct, options: {...selectedProduct.options, groups: newGroups}});
                            }}
                          >
                            <option value="select">드롭다운 (Select)</option>
                            <option value="radio">버튼 (Radio)</option>
                            <option value="dimension">치수 (Dimension)</option>
                          </select>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                              const newGroups = (selectedProduct.options?.groups || []).filter((_, i) => i !== gIdx);
                              setSelectedProduct({...selectedProduct, options: {...selectedProduct.options, groups: newGroups}});
                          }}
                          className="text-red-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {group.values.map((val, vIdx) => (
                          <div key={val.id} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-100">
                             <input 
                                className="flex-1 text-xs border-none focus:ring-0"
                                value={val.label}
                                placeholder="항목명 (예: 아트지 250g)"
                                onChange={(e) => {
                                    const newGroups = [...(selectedProduct.options?.groups || [])];
                                    newGroups[gIdx].values[vIdx].label = e.target.value;
                                    setSelectedProduct({...selectedProduct, options: {...selectedProduct.options, groups: newGroups}});
                                }}
                             />
                             <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                <span className="text-[10px] text-gray-400">+</span>
                                <input 
                                    type="number"
                                    className="w-16 text-right text-xs bg-transparent border-none focus:ring-0 p-0"
                                    value={val.priceAdded || 0}
                                    onChange={(e) => {
                                        const newGroups = [...(selectedProduct.options?.groups || [])];
                                        newGroups[gIdx].values[vIdx].priceAdded = parseInt(e.target.value) || 0;
                                        setSelectedProduct({...selectedProduct, options: {...selectedProduct.options, groups: newGroups}});
                                    }}
                                />
                                <span className="text-[10px] text-gray-400">원</span>
                             </div>
                             <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                                <span className="text-[10px] text-emerald-400">x</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="w-12 text-right text-xs bg-transparent border-none focus:ring-0 p-0 text-emerald-600"
                                    value={val.priceMultiplier || 1}
                                    onChange={(e) => {
                                        const newGroups = [...(selectedProduct.options?.groups || [])];
                                        newGroups[gIdx].values[vIdx].priceMultiplier = parseFloat(e.target.value) || 1;
                                        setSelectedProduct({...selectedProduct, options: {...selectedProduct.options, groups: newGroups}});
                                    }}
                                />
                             </div>
                             <button 
                                type="button"
                                onClick={() => {
                                    const newGroups = [...(selectedProduct.options?.groups || [])];
                                    newGroups[gIdx].values = newGroups[gIdx].values.filter((_, i) => i !== vIdx);
                                    setSelectedProduct({...selectedProduct, options: {...selectedProduct.options, groups: newGroups}});
                                }}
                                className="text-gray-300 hover:text-red-400"
                             >
                                <MinusCircle size={14} />
                             </button>
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={() => {
                              const newGroups = [...(selectedProduct.options?.groups || [])];
                              newGroups[gIdx].values.push({ 
                                  id: `v_${Date.now()}`, 
                                  label: '새 항목', 
                                  priceAdded: 0, 
                                  priceMultiplier: 1 
                              });
                              setSelectedProduct({...selectedProduct, options: {...selectedProduct.options, groups: newGroups}});
                          }}
                          className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 hover:bg-white hover:text-emerald-500 transition-all"
                        >
                          + 항목 추가
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(selectedProduct.options?.groups || []).length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 text-sm">
                        설정된 자동 견적 옵션이 없습니다.<br/>'그룹 추가' 버튼을 눌러 시작하세요.
                    </div>
                  )}
                </div>
              </div>

              {/* Volume Pricing Settings */}
              <div className="mt-8 border-t pt-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">수량별 할인 설정</h4>
                    <p className="text-xs text-gray-500">대량 주문 시 자동 할인을 적용합니다 (예: 10개 이상 10% 할인)</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                        const currentTiers = selectedProduct.volumePricing || [];
                        setSelectedProduct({...selectedProduct, volumePricing: [...currentTiers, { minQuantity: 10, discountRate: 0.1 }]});
                    }}
                    className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-all"
                  >
                    <PlusCircle size={14} /> 구간 추가
                  </button>
                </div>

                <div className="space-y-3">
                  {(selectedProduct.volumePricing || []).map((tier, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-right-2">
                       <div className="flex-1 flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">최소 수량:</span>
                          <input 
                              type="number" 
                              value={tier.minQuantity}
                              onChange={(e) => {
                                  const newTiers = [...(selectedProduct.volumePricing || [])];
                                  newTiers[tIdx].minQuantity = parseInt(e.target.value) || 0;
                                  setSelectedProduct({...selectedProduct, volumePricing: newTiers});
                              }}
                              className="w-20 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs font-medium text-gray-500">개 이상</span>
                       </div>
                       <div className="flex-1 flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">할인율:</span>
                          <input 
                              type="number" 
                              step="0.01"
                              value={tier.discountRate}
                              onChange={(e) => {
                                  const newTiers = [...(selectedProduct.volumePricing || [])];
                                  newTiers[tIdx].discountRate = parseFloat(e.target.value) || 0;
                                  setSelectedProduct({...selectedProduct, volumePricing: newTiers});
                              }}
                              className="w-20 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs font-medium text-gray-500">({(tier.discountRate * 100).toFixed(0)}%)</span>
                       </div>
                       <button 
                          type="button"
                          onClick={() => {
                              const newTiers = (selectedProduct.volumePricing || []).filter((_, i) => i !== tIdx);
                              setSelectedProduct({...selectedProduct, volumePricing: newTiers});
                          }}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                       >
                          <MinusCircle size={18} />
                       </button>
                    </div>
                  ))}
                  
                  {(selectedProduct.volumePricing || []).length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-100 text-gray-400 text-[11px]">
                        추가된 할인 구간이 없습니다.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" className="px-6 py-2 border rounded-lg font-bold" onClick={() => setIsModalOpen(false)}>취소</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
