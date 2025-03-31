import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import axios from "axios";

export function useApi(resource) {
  const baseUrl = "https://localhost:7112/api";
  const data = ref([]);
  const pending = ref(true);
  const error = ref(null);
  const pageNumber = ref(1);
  const pageSize = ref(5);
  const totalPages = ref(0);
  const totalItemsCount = ref(0);

  const refresh = async () => {
    try {
      pending.value = true;
      const response = await $fetch(
        `${baseUrl}/${resource}?searchPhrase=&pageSize=${pageSize.value}&pageNumber=${pageNumber.value}&sortBy=Name`
      );
      console.log(response);
      data.value = response.items;
      pending.value = false;
    } catch (err) {
      error.value = err;
      console.error(`Error fetching ${resource}:`, err);
      pending.value = false;
    }
  };

  const deleteItem = async (id) => {
    try {
      await $fetch(`${baseUrl}/${resource}/${id}`, {
        method: "DELETE",
      });

      toast.success("Successfully deleted", { autoClose: 1000 });

      await refresh();
    } catch (err) {
      toast.error(`Error deleting ${resource}: ${err}`);
    }
  };

  const editItem = async (id, payload) => {
    try {
      await $fetch(`${baseUrl}/${resource}/${id}`, {
        method: "PATCH",
        body: payload,
      });

      toast.success("Successfully edited", { autoClose: 1000 });
      await refresh();
    } catch (error) {
      toast.error(`Error editing ${resource}: ${error}`);
    }
  };

  onMounted(() => {
    refresh();
  });

  const updatePagination = (options) => {
    pageNumber.value = options.page;
    pageSize.value = options.itemsPerPage;
    refresh();
  };

  return {
    editItem,
    deleteItem,
    data,
    pending,
    error,
    refresh,
    updatePagination,
    totalPages,
    totalItemsCount,
  };
}
