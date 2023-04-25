import './styles.scss';

import { debounce } from 'lodash';

document.addEventListener('DOMContentLoaded', () => {
  init();
});

const API_URL = 'https://orgbook.gov.bc.ca/api';

const init = () => {
  const autocompleteInput = document.querySelector('#autocompleteInput');
  const autocompleteItems = document.querySelector('#autocompleteItems');

  if (!(autocompleteInput && autocompleteItems)) {
    return;
  }

  autocompleteInput.addEventListener('input', debounce(search, 300));
};

const search = async () => {
  clearResults();
  const results = await fetchResults(autocompleteInput.value);
  appendResults(results);
};

const fetchResults = async (q) => {
  try {
    if (!q || q.length < 2) {
      return [];
    }
    const response = await (
      await fetch(`${API_URL}/v4/search/topic?q=${q}&inactive=`)
    ).json();
    return response.total ? response.results : [];
  } catch {
    return [];
  }
};

const clearResults = () => {
  // Clear the results
  autocompleteItems.innerHTML = null;
};

const appendResults = (results) => {
  // Append the results
  const list = document.createElement('ul');
  list.classList = ['list-group'];
  results.forEach((result) => {
    const item = document.createElement('li');
    item.classList = ['list-group-item'];

    const businessName = result.names.find(
      (name) => name.type === 'entity_name'
    )?.text;

    const businessNumber = result.names.find(
      (name) => name.type === 'business_number'
    )?.text;

    const sourceId = result.source_id;

    let htmlString = `<div>${businessName}</div>`;
    if (sourceId) {
      htmlString += `<div><small>Registration Number: ${sourceId}</small></div>`;
    }
    if (businessNumber) {
      htmlString += `<div><small>CRA 9-Digit Bsuiness Number: ${businessNumber}</small></div>`;
    }
    item.innerHTML = htmlString;
    list.append(item);
  });
  autocompleteItems.append(list);
};
