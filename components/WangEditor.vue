<template>
  <div style="background-color: #1e1e1e; color: #fff; border: 1px solid #444">
    <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor
      style="height: 500px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script>
import "@wangeditor/editor/dist/css/style.css";
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { Boot, i18nChangeLanguage } from "@wangeditor/editor";

const registerButton = (key, label, templateValue) => {
  Boot.registerMenu({
    key,
    factory() {
      return {
        key,
        tag: "button",
        title: label,
        getValue: () => "",
        isActive: () => false,
        isDisabled: () => false,
        exec(editor) {
          const value =
            typeof templateValue === "function"
              ? templateValue()
              : templateValue;

          if (editor?.insertText) {
            editor.insertText(value);
          } else {
            console.warn(
              "Cannot insert text – editor.insertText is undefined",
              editor
            );
          }
        },
      };
    },
  });
};

// Global guard for hot-reloading in development
if (!window.wangEditorCustomMenusRegistered) {
  console.log("Registering custom WangEditor menus...");
  registerButton("insertMyText", "Insert Text", "Hello, WangEditor 5!");
  registerButton("insert-invoice-number", "Invoice #", "{{ invoiceNumber }}");
  registerButton("insert-vat-id", "VAT ID", "{{ vatId }}");
  registerButton(
    "insert-date",
    "Date",
    () => `{{ ${new Date().toISOString().split("T")[0]} }}`
  );
  registerButton("insert-seller", "Seller", "{{ sellerName }}");
  registerButton("insert-buyer", "Buyer", "{{ buyerName }}");
  window.wangEditorCustomMenusRegistered = true;
  console.log("Custom WangEditor menus registered.");
}

export default {
  components: { Editor, Toolbar },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const editorRef = shallowRef(null);
    const valueHtml = ref(props.modelValue);

    i18nChangeLanguage("en");

    watch(valueHtml, (newVal) => {
      emit("update:modelValue", newVal);
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue !== valueHtml.value) {
          valueHtml.value = newValue;
        }
      }
    );

    const toolbarConfig = {
      toolbarKeys: [
        "headerSelect",
        "bold",
        "italic",
        "underline",
        "bulletedList",
        "numberedList",
        "blockquote",
        "insertLink",
        "insertImage",
        "|",
        "insert-invoice-number", // Your button
        "insert-vat-id", // Your button
        "insert-date", // Your button
        "insert-seller", // Your button
        "insert-buyer", // Your button
        "|",
        "undo",
        "redo",
      ],
    };

    const editorConfig = {
      placeholder: "Type here...",
    };

    const handleCreated = (editor) => {
      editorRef.value = editor;
    };

    onBeforeUnmount(() => {
      if (editorRef.value) {
        editorRef.value.destroy();
        editorRef.value = null;
      }
    });

    return {
      editorRef,
      valueHtml,
      mode: "dark",
      toolbarConfig,
      editorConfig,
      handleCreated,
    };
  },
};
</script>
