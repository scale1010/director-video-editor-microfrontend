import { ILayoutState } from "../interfaces/layout";
import { create } from "zustand";

const useLayoutStore = create<ILayoutState>((set) => ({
	activeMenuItem: "texts",
	showMenuItem: false,
	cropTarget: null,
	showControlItem: false,
	showToolboxItem: false,
	activeToolboxItem: null,
	floatingControl: null,
	drawerOpen: false,
	controItemDrawerOpen: false,
	typeControlItem: "",
	labelControlItem: "",
	isSidebarHovered: false,
	// Right drawer state
	isRightDrawerOpen: false,
	rightDrawerContent: null,
	selectedItem: null,
	setCropTarget: (cropTarget) => set({ cropTarget }),
	setActiveMenuItem: (showMenu) => set({ activeMenuItem: showMenu }),
	setShowMenuItem: (showMenuItem) => set({ showMenuItem }),
	setShowControlItem: (showControlItem) => set({ showControlItem }),
	setShowToolboxItem: (showToolboxItem) => set({ showToolboxItem }),
	setActiveToolboxItem: (activeToolboxItem) => set({ activeToolboxItem }),
	setFloatingControl: (floatingControl) => set({ floatingControl }),
	setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
	trackItem: null,
	setTrackItem: (trackItem) => set({ trackItem }),
	setControItemDrawerOpen: (controItemDrawerOpen) =>
		set({ controItemDrawerOpen }),
	setTypeControlItem: (typeControlItem) => set({ typeControlItem }),
	setLabelControlItem: (labelControlItem) => set({ labelControlItem }),
	setIsSidebarHovered: (isSidebarHovered) => set({ isSidebarHovered }),
	// Right drawer setters
	setIsRightDrawerOpen: (isRightDrawerOpen) => set({ isRightDrawerOpen }),
	setRightDrawerContent: (rightDrawerContent) => set({ rightDrawerContent }),
	setSelectedItem: (selectedItem) => set({ selectedItem }),
}));

export default useLayoutStore;
