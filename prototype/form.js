// 登録 / 編集画面共通のフォーム制御
function initRecipeForm({ mode }) {
  const titleEl = document.getElementById("title");
  const categoryEl = document.getElementById("category");
  const cookingTimeEl = document.getElementById("cooking_time");
  const servingsEl = document.getElementById("servings");
  const memoEl = document.getElementById("memo");
  const ingredientsContainer = document.getElementById("ingredients");
  const stepsContainer = document.getElementById("steps");
  const errorTitle = document.getElementById("error-title");
  const errorIngredients = document.getElementById("error-ingredients");
  const errorSteps = document.getElementById("error-steps");

  ensureUnitDatalist();

  let editingId = null;
  if (mode === "edit") {
    editingId = Number(getQueryParam("id"));
    const recipe = getRecipe(editingId);
    if (!recipe) {
      document.querySelector(".form-page").innerHTML =
        '<div class="empty">レシピが見つかりません</div>';
      return;
    }
    titleEl.value = recipe.title;
    categoryEl.value = recipe.category || "";
    cookingTimeEl.value = recipe.cooking_time ?? "";
    servingsEl.value = recipe.servings ?? "";
    memoEl.value = recipe.memo || "";
    recipe.ingredients.forEach((i) =>
      addIngredientRow(i.name, i.amount, i.unit)
    );
    recipe.steps.forEach((s) => addStepRow(s.description));
  } else {
    addIngredientRow();
    addStepRow();
  }

  function addIngredientRow(name = "", amount = "", unit = "") {
    const row = document.createElement("div");
    row.className = "dynamic-row";
    row.innerHTML = `
      <input type="text" class="ing-name" placeholder="材料名" value="${escapeHtml(
        name
      )}" />
      <input type="number" class="ing-amount amount-num" placeholder="数量" min="0" step="any" value="${escapeHtml(
        amount
      )}" />
      <input type="text" class="ing-unit unit-select" list="unit-options" placeholder="単位" value="${escapeHtml(
        unit
      )}" />
      <button type="button" class="btn-link remove-row">削除</button>
    `;
    row.querySelector(".remove-row").addEventListener("click", () => {
      row.remove();
    });
    ingredientsContainer.appendChild(row);
  }

  function ensureUnitDatalist() {
    if (document.getElementById("unit-options")) return;
    const dl = document.createElement("datalist");
    dl.id = "unit-options";
    dl.innerHTML = UNIT_OPTIONS.map((u) => `<option value="${u}"></option>`).join(
      ""
    );
    document.body.appendChild(dl);
  }

  function addStepRow(description = "") {
    const row = document.createElement("div");
    row.className = "dynamic-row";
    row.innerHTML = `
      <span class="order"></span>
      <input type="text" class="step-text" placeholder="手順" value="${escapeHtml(
        description
      )}" />
      <button type="button" class="btn-link remove-row">削除</button>
    `;
    row.querySelector(".remove-row").addEventListener("click", () => {
      row.remove();
      renumberSteps();
    });
    stepsContainer.appendChild(row);
    renumberSteps();
  }

  function renumberSteps() {
    stepsContainer.querySelectorAll(".dynamic-row .order").forEach((el, i) => {
      el.textContent = `${i + 1}.`;
    });
  }

  document
    .getElementById("add-ingredient")
    .addEventListener("click", () => addIngredientRow());
  document
    .getElementById("add-step")
    .addEventListener("click", () => addStepRow());

  document.getElementById("cancel-btn").addEventListener("click", () => {
    if (mode === "edit" && editingId) {
      window.location.href = `detail.html?id=${editingId}`;
    } else {
      window.location.href = "index.html";
    }
  });

  document.getElementById("submit-btn").addEventListener("click", () => {
    errorTitle.textContent = "";
    errorIngredients.textContent = "";
    errorSteps.textContent = "";

    const title = titleEl.value.trim();
    const ingredients = [
      ...ingredientsContainer.querySelectorAll(".dynamic-row"),
    ]
      .map((row) => ({
        name: row.querySelector(".ing-name").value.trim(),
        amount: row.querySelector(".ing-amount").value.trim(),
        unit: row.querySelector(".ing-unit").value,
      }))
      .filter((i) => i.name);
    const steps = [...stepsContainer.querySelectorAll(".dynamic-row")]
      .map((row, idx) => ({
        order: idx + 1,
        description: row.querySelector(".step-text").value.trim(),
      }))
      .filter((s) => s.description);

    let valid = true;
    if (!title) {
      errorTitle.textContent = "レシピ名を入力してください";
      valid = false;
    }
    if (ingredients.length === 0) {
      errorIngredients.textContent = "材料を 1 件以上入力してください";
      valid = false;
    }
    if (steps.length === 0) {
      errorSteps.textContent = "手順を 1 件以上入力してください";
      valid = false;
    }
    if (!valid) return;

    const list = loadRecipes();
    const data = {
      title,
      category: categoryEl.value || null,
      cooking_time: cookingTimeEl.value ? Number(cookingTimeEl.value) : null,
      servings: servingsEl.value ? Number(servingsEl.value) : null,
      ingredients,
      steps,
      memo: memoEl.value.trim(),
    };

    if (mode === "edit") {
      const idx = list.findIndex((r) => r.id === editingId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data };
      }
      saveRecipes(list);
      window.location.href = `detail.html?id=${editingId}`;
    } else {
      const newRecipe = {
        id: nextId(list),
        ...data,
        created_at: new Date().toISOString(),
      };
      list.push(newRecipe);
      saveRecipes(list);
      window.location.href = "index.html";
    }
  });
}
