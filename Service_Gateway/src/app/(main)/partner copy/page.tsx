'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from '../../store/authStore';
import Link from 'next/link';

interface Partner {
  id: number;
  name: string;
  telnum: string;
  level: string;
  created: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function PartnerPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [name, setName] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = getCookie('role');

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const page = searchParams.get('page') || '1';
        const currentName = searchParams.get('name');
        
        let url = `/api/partner?page=${page}&limit=${pagination.itemsPerPage}`;
        if (currentName) {
          url += `&name=${currentName}`;
        }

        const response = await fetch(url);
        const result = await response.json();
        
        if (!result.success) {
          alert(result.message);
          return;
        }

        setPartners(result.data);
        setPagination(result.pagination);
      } catch (error) {
        alert('파트너 목록 조회에 실패했습니다.');
      }
    };

    fetchPartners();
  }, [searchParams, pagination.itemsPerPage]);

  // 검색 버튼 클릭 핸들러
  const handleSearchClick = () => {
    try {
      const params = new URLSearchParams();
      if (name.trim()) {  // 공백 제거 후 체크
        params.set('name', name.trim());
      }
      params.set('page', '1');

      // URL 업데이트
      router.push(`/partner?${params.toString()}`);
    } catch (error) {
      // alert('검색 중 오류가 발생했습니다.');
      alert(error);
    }
  };

  // 초기화 버튼 클릭 핸들러
  const handleResetClick = () => {
    setName('');
    router.push('/partner?page=1');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/partner?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">파트너 관리</h1>
        <Link
          href="/partner/register"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          파트너 등록
        </Link>
      </div>

      {/* 검색 필터 */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="회사이름으로 검색"
          className="px-3 py-2 border rounded-md"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchClick();
            }
          }}
        />
        <button
          type="button"
          onClick={handleSearchClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          검색
        </button>
        {searchParams.get('name') && (
          <button
            type="button"
            onClick={handleResetClick}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            초기화
          </button>
        )}
      </div>

      {/* 파트너 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회사이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                전화번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                등급
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/partner/${partner.id}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.telnum}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.created}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/partner/${partner.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    상세
                  </Link>
                  <button
                    onClick={() => {}}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td> */}
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  파트너 정보가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            이전
          </button>

          <span className="px-4">
            {pagination.currentPage} / {pagination.totalPages} 페이지
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      {/* 총 아이템 수 */}
      {/* <div className="text-center mt-2 text-gray-600">
        총 {pagination.totalItems}개의 파트너
      </div> */}
    </div>
  );
} 
