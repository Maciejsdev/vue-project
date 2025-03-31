import axios from "axios";

const API_BASE_URL = "https://localhost:7112/api";

const apiCall = async ({
  route,
  method = "GET",
  data = null,
  params = {},
  headers = {},
}) => {
  try {
    const response = await axios({
      url: `${API_BASE_URL}/${route}`,
      method,
      data,
      params,
      headers: {
        ...headers,
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Call Error:", error);
    throw error.response ? error.response.data : error;
  }
};

// Fetch Data (Reusable)
const fetchData = async ({ route, search, options, setData }) => {
  try {
    const response = await apiCall({
      route,
      method: "GET",
      params: {
        searchPhrase: search.value,
        pageSize: options.value.pageSize,
        pageNumber: options.value.page,
        sortBy: "Name",
      },
    });

    setData(
      response.items || [],
      response.totalItemsCount || 0,
      response.totalPages || 0
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Delete Item (Reusable)
const deleteItem = async ({ route, id, onSuccess }) => {
  try {
    await apiCall({ route: `${route}/${id}`, method: "DELETE" });
    onSuccess();
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

// Update Pagination (Reusable)
const updatePagination = ({ newOptions, options, refresh }) => {
  options.value.page = newOptions.page;
  options.value.pageSize = newOptions.itemsPerPage;
  refresh();
};

export { apiCall, fetchData, deleteItem, updatePagination };
