import { NextRequest, NextResponse } from 'next/server';
import { getUserAddresses, addAddress, updateAddress, deleteAddress } from '@/lib/addresses';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['customer', 'seller', 'admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const addresses = await getUserAddresses(auth.userId!);
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error('Addresses GET error:', error);
    return NextResponse.json({ error: '배송지 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['customer', 'seller', 'admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const body = await request.json();
    const { action, addressId, ...data } = body;

    if (action === 'delete' && addressId) {
      const success = await deleteAddress(addressId);
      return success
        ? NextResponse.json({ success: true, message: '배송지가 삭제되었습니다.' })
        : NextResponse.json({ error: '삭제 실패' }, { status: 500 });
    }

    if (action === 'update' && addressId) {
      const success = await updateAddress(addressId, { ...data, userId: auth.userId! });
      return success
        ? NextResponse.json({ success: true, message: '배송지가 수정되었습니다.' })
        : NextResponse.json({ error: '수정 실패' }, { status: 500 });
    }

    // 새 배송지 추가
    const { label, name, phone, postalCode, address, addressDetail, isDefault } = data;
    if (!name || !phone || !address) {
      return NextResponse.json({ error: '수령인, 연락처, 주소는 필수입니다.' }, { status: 400 });
    }

    const id = await addAddress({
      userId: auth.userId!,
      label: label || '',
      name, phone, postalCode: postalCode || '', address, addressDetail: addressDetail || '',
      isDefault: isDefault || false,
    });

    return id
      ? NextResponse.json({ success: true, id, message: '배송지가 추가되었습니다.' })
      : NextResponse.json({ error: '배송지 추가 실패' }, { status: 500 });
  } catch (error) {
    console.error('Addresses POST error:', error);
    return NextResponse.json({ error: '배송지 처리 실패' }, { status: 500 });
  }
}
