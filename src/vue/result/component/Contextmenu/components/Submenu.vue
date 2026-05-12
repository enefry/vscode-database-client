<template>
  <transition name="contextmenu-submenu-fade">
    <div
      ref="menu"
      :class="[commonClassInternal.menu, 'menu', customClass]"
      :style="{left: style.left + 'px', top: style.top + 'px', minWidth: style.minWidth + 'px', zIndex: style.zIndex}"
      v-if="visible"
      @contextmenu="(e)=>e.preventDefault()"
    >
      <div class="menu_body">
        <template v-for="(item,index) of itemsInternal">
          <template v-if="!item.hidden">
            <div
              :class="[
                commonClassInternal.menuItem, commonClassInternal.unclickableMenuItem,
                'menu_item', 'menu_item__disabled',
                item.divided?'menu_item__divided':null
              ]"
              :key="'disabled-' + index"
              v-if="item.disabled"
            >
              <div class="menu_item_icon" v-if="hasIcon">
                <i :class="item.icon" v-if="item.icon"></i>
              </div>
              <span class="menu_item_label" :title="item.label">{{item.label}}</span>
              <div class="menu_item_expand_icon"></div>
            </div>
            <div
              :class="[
                commonClassInternal.menuItem, commonClassInternal.unclickableMenuItem,
                'menu_item', 'menu_item__available',
                activeSubmenu.index===index? 'menu_item_expand':null,
                item.divided?'menu_item__divided':null
              ]"
              :key="'children-' + index"
              @mouseenter="($event)=>enterItem($event,item,index)"
              v-else-if="item.children"
            >
              <div class="menu_item_icon" v-if="hasIcon">
                <i :class="item.icon" v-if="item.icon"></i>
              </div>
              <span class="menu_item_label" :title="item.label">{{item.label}}</span>
              <div class="menu_item_expand_icon">▶</div>
            </div>
            <div
              :class="[
                commonClassInternal.menuItem, commonClassInternal.clickableMenuItem,
                'menu_item', 'menu_item__available',
                item.divided?'menu_item__divided':null
              ]"
              :key="'item-' + index"
              @mouseenter="($event)=>enterItem($event,item,index)"
              @click="itemClick(item)"
              v-else
            >
              <div class="menu_item_icon" v-if="hasIcon">
                <i :class="item.icon" v-if="item.icon"></i>
              </div>
              <span class="menu_item_label" :title="item.label">{{item.label}}</span>
              <div class="menu_item_expand_icon"></div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import { createApp } from "vue";
import {
  SUBMENU_X_OFFSET,
  SUBMENU_Y_OFFSET,
  SUBMENU_OPEN_TREND_LEFT,
  SUBMENU_OPEN_TREND_RIGHT,
  COMPONENT_NAME
} from "../constant";

// Import self for recursive submenu creation
import Submenu from "./Submenu";

export default {
  name: COMPONENT_NAME,
  props: {
    commonClass: Object,
    position: Object,
    minWidth: { type: Number, default: 150 },
    zIndex: { type: Number, default: 2 },
    customClass: String,
    openTrend: { type: String, default: SUBMENU_OPEN_TREND_RIGHT },
    items: Array,
    onClose: Function
  },
  data() {
    return {
      commonClassInternal: this.commonClass || {
        menu: null,
        menuItem: null,
        clickableMenuItem: null,
        unclickableMenuItem: null
      },
      activeSubmenu: {
        index: null,
        app: null,
        container: null
      },
      itemsInternal: this.items || [],
      positionInternal: this.position || { x: 0, y: 0, width: 0, height: 0 },
      style: {
        left: 0,
        top: 0,
        zIndex: this.zIndex || 2,
        minWidth: this.minWidth || 150
      },
      visible: false,
      hasIcon: false,
      openTrendInternal: this.openTrend || SUBMENU_OPEN_TREND_RIGHT
    };
  },
  mounted() {
    this.visible = true;
    for (let item of this.itemsInternal) {
      if (item.icon) {
        this.hasIcon = true;
        break;
      }
    }
    this.$nextTick(() => {
      const windowWidth = document.documentElement.clientWidth;
      const windowHeight = document.documentElement.clientHeight;
      const menu = this.$refs.menu;
      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;

      (this.openTrendInternal === SUBMENU_OPEN_TREND_LEFT
        ? this.leftOpen
        : this.rightOpen)(windowWidth, windowHeight, menuWidth);

      this.style.top = this.positionInternal.y;
      if (this.positionInternal.y + menuHeight > windowHeight) {
        if (this.positionInternal.height === 0) {
          this.style.top = this.positionInternal.y - menuHeight;
        } else {
          this.style.top = windowHeight - menuHeight;
        }
      }
    });
  },
  methods: {
    leftOpen(windowWidth, windowHeight, menuWidth) {
      this.style.left = this.positionInternal.x - menuWidth;
      this.openTrendInternal = SUBMENU_OPEN_TREND_LEFT;
      if (this.style.left < 0) {
        this.openTrendInternal = SUBMENU_OPEN_TREND_RIGHT;
        if (this.positionInternal.width === 0) {
          this.style.left = 0;
        } else {
          this.style.left = this.positionInternal.x + this.positionInternal.width;
        }
      }
    },
    rightOpen(windowWidth, windowHeight, menuWidth) {
      this.style.left = this.positionInternal.x + this.positionInternal.width;
      this.openTrendInternal = SUBMENU_OPEN_TREND_RIGHT;
      if (this.style.left + menuWidth > windowWidth) {
        this.openTrendInternal = SUBMENU_OPEN_TREND_LEFT;
        if (this.positionInternal.width === 0) {
          this.style.left = windowWidth - menuWidth;
        } else {
          this.style.left = this.positionInternal.x - menuWidth;
        }
      }
    },
    destroyActiveSubmenu() {
      if (this.activeSubmenu.app) {
        this.activeSubmenu.app.unmount();
        this.activeSubmenu.app = null;
      }
      if (this.activeSubmenu.container && this.activeSubmenu.container.parentNode) {
        this.activeSubmenu.container.parentNode.removeChild(this.activeSubmenu.container);
        this.activeSubmenu.container = null;
      }
      this.activeSubmenu.index = null;
    },
    enterItem(e, item, index) {
      if (!this.visible) {
        return;
      }
      if (this.activeSubmenu.app) {
        if (this.activeSubmenu.index === index) {
          return;
        } else {
          this.destroyActiveSubmenu();
        }
      }
      if (!item.children) {
        return;
      }
      const menuItemClientRect = e.target.getBoundingClientRect();
      const container = document.createElement('div');
      document.body.appendChild(container);

      const submenuApp = createApp(Submenu, {
        items: item.children,
        openTrend: this.openTrendInternal,
        commonClass: this.commonClassInternal,
        position: {
          x: menuItemClientRect.x + SUBMENU_X_OFFSET,
          y: menuItemClientRect.y + SUBMENU_Y_OFFSET,
          width: menuItemClientRect.width - 2 * SUBMENU_X_OFFSET,
          height: menuItemClientRect.width
        },
        minWidth: typeof item.minWidth === "number" ? item.minWidth : this.style.minWidth,
        zIndex: this.style.zIndex,
        customClass: typeof item.customClass === "string" ? item.customClass : this.customClass,
        onClose: () => this.destroyActiveSubmenu()
      });
      submenuApp.component(COMPONENT_NAME, Submenu);
      submenuApp.mount(container);

      this.activeSubmenu.index = index;
      this.activeSubmenu.app = submenuApp;
      this.activeSubmenu.container = container;
    },
    itemClick(item) {
      if (!this.visible) {
        return;
      }
      if (
        item &&
        !item.disabled &&
        !item.hidden &&
        typeof item.onClick === "function"
      ) {
        return item.onClick();
      }
    },
    close() {
      this.visible = false;
      this.destroyActiveSubmenu();
      this.$nextTick(() => {
        if (this.onClose) this.onClose();
      });
    }
  }
};
</script>

<style scoped>
.menu {
  position: fixed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  background: var(--vscode-menu-background);
  border-radius: 4px;
}
.menu_body {
  display: block;
}
.menu_item {
  list-style: none;
  line-height: 32px;
  padding: 0 16px;
  margin: 0;
  font-size: var(--vscode-font-size);
  outline: 0;
  display: flex;
  align-items: center;
  transition: 0.2s;
}
.menu_item__divided {
  border-bottom: 1px solid #666A71;
}
.menu_item .menu_item_icon {
  margin-right: 8px;
  width: 13px;
}
.menu_item .menu_item_label {
  flex: 1;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.menu_item .menu_item_expand_icon {
  margin-left: 16px;
  font-size: 6px;
  width: 10px;
}
.menu_item__available {
  color: var(--vscode-menu-foreground);
  cursor: pointer;
}
.menu_item__available:hover {
  background: var(--vscode-menu-selectionBackground);
  color: var(--vscode-menu-selectionForeground);
}
.menu_item__disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
.menu_item_expand {
  background: var(--vscode-menu-selectionBackground);
  color: var(--vscode-menu-selectionForeground);
}
</style>

<style>
.contextmenu-submenu-fade-enter-active,
.contextmenu-submenu-fade-leave-active {
  transition: opacity 0.1s;
}
.contextmenu-submenu-fade-enter-from,
.contextmenu-submenu-fade-leave-to {
  opacity: 0;
}
</style>
