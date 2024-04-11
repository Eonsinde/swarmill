import { create } from "zustand"

export type ModalType = 
    "authModal"     |
    "uploadModal"   |
    "deleteFile";

type ModalStoreType = {
    isOpen: boolean
    type: ModalType | null
    data?: any
    onOpen: (type: ModalType, modalData?: any) => void
    onClose: () => void
}

const useModalStore = create<ModalStoreType>()((set) => ({
    isOpen: false,
    type: null,
    data: undefined,
    onOpen: (type, modalData) => set(({ isOpen: true, type, data: modalData })),
    onClose: () => set(({ isOpen: false, type: null }))
}))

export default useModalStore