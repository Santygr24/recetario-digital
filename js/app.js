(() => {

    "use strict";


    // =========================================
    // CONFIGURACIÓN GENERAL
    // =========================================

    const TABLE_NAME = "recetas";

    const STORAGE_KEY = "recetario-digital-demo-recipes-v1";

    const CATEGORIES = [
        "Comidas",
        "Postres",
        "Desayunos",
        "Bebidas"
    ];


    // =========================================
    // RECETAS DE EJEMPLO
    // =========================================

    const sampleRecipes = [

        {
            id: "demo-1",

            nombre: "Tarta de verduras",

            categoria: "Comidas",

            ingredientes:
                "1 tapa de tarta\n" +
                "2 zanahorias\n" +
                "1 zapallito\n" +
                "1 cebolla\n" +
                "2 huevos\n" +
                "Sal y pimienta",

            preparacion:
                "Cortá las verduras en cubos pequeños.\n" +
                "Salteá la cebolla y agregá el resto de las verduras.\n" +
                "Mezclá con los huevos y condimentá.\n" +
                "Colocá el relleno sobre la masa y horneá hasta dorar.",

            created_at: "2026-10-25T12:00:00.000Z"
        },


        {
            id: "demo-2",

            nombre: "Panqueques caseros",

            categoria: "Desayunos",

            ingredientes:
                "1 taza de harina\n" +
                "1 taza de leche\n" +
                "1 huevo\n" +
                "1 cucharadita de azúcar\n" +
                "Manteca para la sartén",

            preparacion:
                "Colocá la harina, la leche, el huevo y el azúcar en un recipiente.\n" +
                "Mezclá hasta obtener una preparación sin grumos.\n" +
                "Calentá una sartén con un poco de manteca.\n" +
                "Cociná los panqueques de ambos lados.",

            created_at: "2026-10-24T12:00:00.000Z"
        },


        {
            id: "demo-3",

            nombre: "Budín de limón",

            categoria: "Postres",

            ingredientes:
                "2 tazas de harina leudante\n" +
                "1 taza de azúcar\n" +
                "2 huevos\n" +
                "1/2 taza de aceite\n" +
                "Jugo y ralladura de 1 limón",

            preparacion:
                "Batí los huevos con el azúcar.\n" +
                "Agregá el aceite, el jugo y la ralladura de limón.\n" +
                "Incorporá la harina y mezclá.\n" +
                "Volcá en un molde y horneá hasta que esté cocido.",

            created_at: "2026-10-23T12:00:00.000Z"
        },


        {
            id: "demo-4",

            nombre: "Limonada",

            categoria: "Bebidas",

            ingredientes:
                "3 limones\n" +
                "1 litro de agua fría\n" +
                "Azúcar a gusto\n" +
                "Hielo",

            preparacion:
                "Exprimí los limones y colá el jugo.\n" +
                "Mezclá con el agua fría.\n" +
                "Agregá azúcar a gusto y revolvé.\n" +
                "Serví con hielo.",

            created_at: "2026-10-22T12:00:00.000Z"
        },


        {
            id: "demo-5",

            nombre: "Fideos con salsa",

            categoria: "Comidas",

            ingredientes:
                "250 g de fideos\n" +
                "2 tomates\n" +
                "1 cebolla\n" +
                "1 cucharada de aceite\n" +
                "Sal y orégano",

            preparacion:
                "Picá la cebolla y los tomates.\n" +
                "Cociná la cebolla en una sartén con aceite y agregá el tomate.\n" +
                "Condimentá y cociná la salsa durante unos minutos.\n" +
                "Herví los fideos, escurrilos y servilos con la salsa.",

            created_at: "2026-10-21T12:00:00.000Z"
        },


        {
            id: "demo-6",

            nombre: "Ensalada de frutas",

            categoria: "Postres",

            ingredientes:
                "1 manzana\n" +
                "1 banana\n" +
                "1 naranja\n" +
                "1 pera\n" +
                "Jugo de naranja",

            preparacion:
                "Lavá y pelá las frutas que lo necesiten.\n" +
                "Cortá todas las frutas en cubos.\n" +
                "Colocalas en un recipiente y agregá el jugo de naranja.\n" +
                "Mezclá y llevá a la heladera antes de servir.",

            created_at: "2026-10-20T12:00:00.000Z"
        }

    ];


    // =========================================
    // ELEMENTOS HTML
    // =========================================

    const elements = {

        recipesGrid:
            document.getElementById("recipesGrid"),

        recipeCount:
            document.getElementById("recipeCount"),

        searchInput:
            document.getElementById("searchInput"),

        categoryFilters:
            document.getElementById("categoryFilters"),

        emptyState:
            document.getElementById("emptyState"),

        emptyTitle:
            document.getElementById("emptyTitle"),

        emptyMessage:
            document.getElementById("emptyMessage"),

        connectionStatus:
            document.getElementById("connectionStatus"),

        recipeDialog:
            document.getElementById("recipeDialog"),

        addDialog:
            document.getElementById("addDialog"),

        recipeForm:
            document.getElementById("recipeForm"),

        formMessage:
            document.getElementById("formMessage"),

        saveRecipeBtn:
            document.getElementById("saveRecipeBtn"),
        deleteRecipeBtn:
           document.getElementById("deleteRecipeBtn"),

        toast:
            document.getElementById("toast")

    };


    // =========================================
    // VARIABLES DEL SISTEMA
    // =========================================

    let recipes = [];

    let selectedCategory = "Todas";

    let supabaseClient = null;

    let demoMode = false;

    let toastTimeout = null;

// Receta que se está consultando
    let currentRecipe = null;

// Canal de sincronización en tiempo real
    let realtimeChannel = null;


    // =========================================
    // COMPROBAR CONFIGURACIÓN DE SUPABASE
    // =========================================

    function isSupabaseConfigured() {

        const config = window.APP_CONFIG || {};

        return Boolean(

            config.SUPABASE_URL &&

            config.SUPABASE_ANON_KEY &&

            config.SUPABASE_URL.startsWith("https://") &&

            !config.SUPABASE_URL.includes("PEGAR_AQUI") &&

            !config.SUPABASE_ANON_KEY.includes("PEGAR_AQUI")

        );

    }


    // =========================================
    // OBTENER RECETAS DEL NAVEGADOR
    // =========================================

    function getDemoRecipes() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved) {

                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {

                    return parsed;

                }

            }

        } catch (error) {

            console.warn(
                "No se pudieron leer las recetas:",
                error
            );

        }


        return [...sampleRecipes];

    }


    // =========================================
    // GUARDAR RECETAS EN EL NAVEGADOR
    // =========================================

    function saveDemoRecipes() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(recipes)
            );

        } catch (error) {

            console.error(
                "No se pudieron guardar las recetas:",
                error
            );

            throw new Error(
                "No se pudieron guardar los datos en el navegador."
            );

        }

    }


    // =========================================
    // ICONOS SEGÚN LA CATEGORÍA
    // =========================================

    function categoryIcon(category) {

        const icons = {

            Comidas: "🍝",

            Postres: "🍰",

            Desayunos: "☕",

            Bebidas: "🥤"

        };

        return icons[category] || "🍽️";

    }


    // =========================================
    // CREAR ELEMENTOS HTML
    // =========================================

    function createElement(tag, className, text) {

        const element = document.createElement(tag);

        if (className) {

            element.className = className;

        }

        if (text !== undefined) {

            element.textContent = text;

        }

        return element;

    }


    // =========================================
    // FORMATEAR FECHAS
    // =========================================

    function formatDate(value) {

        if (!value) return "";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {

            return "";

        }

        return new Intl.DateTimeFormat("es-AR", {

            day: "numeric",

            month: "long",

            year: "numeric"

        }).format(date);

    }


    // =========================================
    // MOSTRAR MENSAJE DE CONFIRMACIÓN
    // =========================================

    function showToast(message) {

        elements.toast.textContent = message;

        elements.toast.classList.add("is-visible");

        window.clearTimeout(toastTimeout);

        toastTimeout = window.setTimeout(() => {

            elements.toast.classList.remove("is-visible");

        }, 2800);

    }


    // =========================================
    // MOSTRAR ESTADO DE CONEXIÓN
    // =========================================

    function setConnectionStatus(message, type = "info") {

        elements.connectionStatus.textContent = message;

        elements.connectionStatus.className =
            `connection-status ${type}`;

    }


    // =========================================
    // CREAR UNA TARJETA DE RECETA
    // =========================================

    function createRecipeCard(recipe) {

        const card = createElement(
            "article",
            "recipe-card"
        );


        // Parte visual

        const visual = createElement(
            "div",
            "recipe-card-visual"
        );

        visual.append(

            createElement(
                "span",
                "recipe-emoji",
                categoryIcon(recipe.categoria)
            )

        );


        // Categoría

        const category = createElement(
            "span",
            "recipe-tag",
            recipe.categoria || "Sin categoría"
        );

        visual.append(category);


        // Contenido

        const body = createElement(
            "div",
            "recipe-card-body"
        );


        // Nombre

        const title = createElement(
            "h3",
            "recipe-card-title",
            recipe.nombre
        );


        // Vista previa de ingredientes

        const preview = createElement(
            "p",
            "recipe-card-preview",
            (recipe.ingredientes || "")
                .split("\n")
                .filter(Boolean)
                .slice(0, 3)
                .join(" · ")
        );


        // Pie de la tarjeta

        const footer = createElement(
            "div",
            "recipe-card-footer"
        );


        const date = createElement(
            "span",
            "recipe-card-date",
            formatDate(recipe.created_at)
        );


        // Botón para ver detalles

        const button = createElement(
            "button",
            "text-button",
            "Ver receta →"
        );

        button.type = "button";

        button.addEventListener("click", () => {

            openRecipeDetails(recipe);

        });


        footer.append(date, button);

        body.append(title, preview, footer);

        card.append(visual, body);


        return card;

    }


    // =========================================
    // MOSTRAR Y FILTRAR RECETAS
    // =========================================

    function renderRecipes() {

        const search = elements.searchInput
            .value
            .trim()
            .toLocaleLowerCase("es");


        // Aplicar filtros

        const filtered = recipes.filter((recipe) => {

            const matchesName = (recipe.nombre || "")
                .toLocaleLowerCase("es")
                .includes(search);


            const matchesCategory =
                selectedCategory === "Todas" ||
                recipe.categoria === selectedCategory;


            return matchesName && matchesCategory;

        });


        // Limpiar tarjetas anteriores

        elements.recipesGrid.replaceChildren();


        // Mostrar las recetas filtradas

        filtered.forEach((recipe) => {

            elements.recipesGrid.append(
                createRecipeCard(recipe)
            );

        });


        // Actualizar contador

        elements.recipeCount.textContent =
            `${filtered.length} ${
                filtered.length === 1 ? "receta" : "recetas"
            }`;


        // Mostrar u ocultar el mensaje vacío

        elements.emptyState.hidden =
            filtered.length !== 0;


        // Cambiar el mensaje según el resultado

        if (filtered.length === 0) {

            if (recipes.length === 0) {

                elements.emptyTitle.textContent =
                    "Todavía no hay recetas";

                elements.emptyMessage.textContent =
                    "Sé el primero en agregar una preparación al recetario.";

            } else {

                elements.emptyTitle.textContent =
                    "No encontramos recetas";

                elements.emptyMessage.textContent =
                    "Probá con otra búsqueda o elegí una categoría diferente.";

            }

        }

    }


    // =========================================
    // ABRIR DETALLES DE UNA RECETA
    // =========================================

    function openRecipeDetails(recipe) {
      currentRecipe = recipe;
        elements.deleteRecipeBtn.hidden = false;

        document.getElementById("detailCategory").textContent =
            (recipe.categoria || "RECETA").toUpperCase();


        document.getElementById("detailIcon").textContent =
            categoryIcon(recipe.categoria);


        document.getElementById("detailTitle").textContent =
            recipe.nombre || "Receta sin nombre";


        document.getElementById("detailDate").textContent =
            recipe.created_at
                ? `Agregada el ${formatDate(recipe.created_at)}`
                : "";


        // Lista de ingredientes

        const ingredientList =
            document.getElementById("detailIngredients");

        ingredientList.replaceChildren();


        (recipe.ingredientes || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {

                ingredientList.append(
                    createElement("li", "", line)
                );

            });


        // Lista de preparación

        const preparationList =
            document.getElementById("detailPreparation");

        preparationList.replaceChildren();


        (recipe.preparacion || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {

                preparationList.append(
                    createElement("li", "", line)
                );

            });


        // Abrir ventana

        elements.recipeDialog.showModal();

    }


    // =========================================
    // ABRIR FORMULARIO PARA AGREGAR RECETA
    // =========================================

    function openAddDialog() {

        elements.formMessage.textContent = "";

        elements.recipeForm.reset();

        elements.addDialog.showModal();

        document.getElementById("recipeName").focus();

    }


    // =========================================
    // CARGAR RECETAS DESDE LA BASE DE DATOS
    // =========================================

    async function loadRecipes() {

        elements.recipesGrid.setAttribute(
            "aria-busy",
            "true"
        );


        // MODO DEMOSTRACIÓN

        if (demoMode) {

            recipes = getDemoRecipes();

            setConnectionStatus(
                "Modo demostración: las recetas se guardan en este navegador. Configurá Supabase para compartirlas en Internet.",
                "demo"
            );

            renderRecipes();

            return;

        }


        // MODO SUPABASE

        try {

            const { data, error } = await supabaseClient

                .from(TABLE_NAME)

                .select(
                    "id, nombre, categoria, ingredientes, preparacion, created_at"
                )

                .order("created_at", {
                    ascending: false
                });


            if (error) {

                throw error;

            }


            recipes = data || [];


            setConnectionStatus(
                "Conectado a la base de datos en la nube.",
                "success"
            );


            renderRecipes();


        } catch (error) {

            console.error(
                "Error al cargar recetas:",
                error
            );


            recipes = [];


            setConnectionStatus(
                "No se pudo conectar con Supabase. Revisá la URL, la clave y las políticas de la tabla recetas.",
                "error"
            );


            renderRecipes();

        }

    }


    // =========================================
    // AGREGAR UNA RECETA NUEVA
    // =========================================

    async function addRecipe(event) {

        event.preventDefault();

        elements.formMessage.textContent = "";


        // Obtener datos del formulario

        const formData = new FormData(
            elements.recipeForm
        );


        const recipe = {

            nombre: String(
                formData.get("nombre") || ""
            ).trim(),

            categoria: String(
                formData.get("categoria") || ""
            ).trim(),

            ingredientes: String(
                formData.get("ingredientes") || ""
            ).trim(),

            preparacion: String(
                formData.get("preparacion") || ""
            ).trim()

        };


        // Validar campos

        if (
            !recipe.nombre ||
            !recipe.categoria ||
            !recipe.ingredientes ||
            !recipe.preparacion
        ) {

            elements.formMessage.textContent =
                "Completá todos los campos antes de guardar.";

            return;

        }


        // Validar categoría

        if (!CATEGORIES.includes(recipe.categoria)) {

            elements.formMessage.textContent =
                "Seleccioná una categoría válida.";

            return;

        }


        // Deshabilitar botón mientras guarda

        elements.saveRecipeBtn.disabled = true;

        elements.saveRecipeBtn.textContent =
            "Guardando...";


        try {


            // GUARDAR EN MODO DEMOSTRACIÓN

            if (demoMode) {

                const newRecipe = {

                    ...recipe,

                    id: `demo-${Date.now()}`,

                    created_at: new Date().toISOString()

                };


                recipes.unshift(newRecipe);

                saveDemoRecipes();

            }


            // GUARDAR EN SUPABASE

            else {

                const { data, error } = await supabaseClient

                    .from(TABLE_NAME)

                    .insert(recipe)

                    .select(
                        "id, nombre, categoria, ingredientes, preparacion, created_at"
                    )

                    .single();


                if (error) {

                    throw error;

                }


                recipes.unshift(data);

            }


            // Cerrar formulario

            elements.addDialog.close();

            elements.recipeForm.reset();


            // Restablecer filtros

            selectedCategory = "Todas";


            elements.categoryFilters
                .querySelectorAll("[data-category]")
                .forEach((button) => {

                    const active =
                        button.dataset.category === "Todas";


                    button.classList.toggle(
                        "is-active",
                        active
                    );


                    button.setAttribute(
                        "aria-pressed",
                        String(active)
                    );

                });


            elements.searchInput.value = "";


            // Actualizar pantalla

            renderRecipes();


            // Confirmación

            showToast(
                "¡La receta se agregó correctamente!"
            );


        } catch (error) {

            console.error(
                "Error al guardar receta:",
                error
            );


            elements.formMessage.textContent =
                error.message ||
                "No se pudo guardar la receta. Revisá la conexión y volvé a intentarlo.";

        } finally {

            elements.saveRecipeBtn.disabled = false;

            elements.saveRecipeBtn.textContent =
                "Guardar receta";

        }

    }


    // =========================================
    // ACTUALIZAR BOTÓN DE CATEGORÍA ACTIVA
    // =========================================

    function updateCategoryButtons(activeButton) {

        elements.categoryFilters
            .querySelectorAll("[data-category]")
            .forEach((button) => {

                const active = button === activeButton;

                button.classList.toggle(
                    "is-active",
                    active
                );

                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );

            });

    }
// =========================================
// ELIMINAR UNA RECETA
// =========================================

async function deleteCurrentRecipe() {

    if (!currentRecipe) {
        return;
    }

    const recipeToDelete = currentRecipe;

    const confirmed = window.confirm(
        `¿Seguro que querés eliminar "${recipeToDelete.nombre}"?`
    );

    if (!confirmed) {
        return;
    }

    elements.deleteRecipeBtn.disabled = true;

    try {

        // MODO DEMOSTRACIÓN

        if (demoMode) {

            recipes = recipes.filter((recipe) =>
                String(recipe.id) !== String(recipeToDelete.id)
            );

            saveDemoRecipes();

        }

        // MODO SUPABASE

        else {

            const { error } = await supabaseClient
                .from(TABLE_NAME)
                .delete()
                .eq("id", recipeToDelete.id);

            if (error) {
                throw error;
            }

        }

        elements.recipeDialog.close();

        currentRecipe = null;

        // Actualizar la página

        if (demoMode) {

            renderRecipes();

        } else {

            await loadRecipes();

        }

        showToast("¡Receta eliminada correctamente!");

    } catch (error) {

        console.error(
            "Error al eliminar receta:",
            error
        );

        showToast(
            "No se pudo eliminar la receta."
        );

    } finally {

        elements.deleteRecipeBtn.disabled = false;

    }

}


// =========================================
// SINCRONIZACIÓN EN TIEMPO REAL
// =========================================

function startRealtimeSubscription() {

    if (demoMode || !supabaseClient) {
        return;
    }

    // Evitar duplicar conexiones

    if (realtimeChannel) {

        supabaseClient.removeChannel(
            realtimeChannel
        );

    }

    // Escuchar todos los cambios de la tabla

    realtimeChannel = supabaseClient

        .channel("recetas-cambios-en-vivo")

        .on(
            "postgres_changes",

            {
                event: "*",
                schema: "public",
                table: TABLE_NAME
            },

            async (payload) => {

                console.log(
                    "Cambio recibido desde Supabase:",
                    payload.eventType
                );

                // Volver a consultar las recetas
                // para actualizar la pantalla.

                await loadRecipes();

            }

        )

        .subscribe((status) => {

            console.log(
                "Estado de sincronización:",
                status
            );

            if (status === "SUBSCRIBED") {

                setConnectionStatus(
                    "Conectado: sincronización en tiempo real activa.",
                    "success"
                );

            }

            if (
                status === "CHANNEL_ERROR" ||
                status === "TIMED_OUT"
            ) {

                setConnectionStatus(
                    "La base de datos funciona, pero falló la sincronización en tiempo real. Revisá la configuración de Supabase.",
                    "error"
                );

            }

        });

}

    // =========================================
    // REGISTRAR EVENTOS
    // =========================================

    function registerEvents() {
      // ELIMINAR RECETA

      elements.deleteRecipeBtn.addEventListener(
       "click",
      deleteCurrentRecipe
    );


        // BUSCADOR

        elements.searchInput.addEventListener(
            "input",
            renderRecipes
        );


        // FILTROS

        elements.categoryFilters.addEventListener(
            "click",
            (event) => {

                const button = event.target.closest(
                    "button[data-category]"
                );

                if (!button) return;


                selectedCategory = button.dataset.category;

                updateCategoryButtons(button);

                renderRecipes();

            }
        );


        // ABRIR FORMULARIO

        document.getElementById("openAddBtn")
            .addEventListener(
                "click",
                openAddDialog
            );


        document.getElementById("emptyAddBtn")
            .addEventListener(
                "click",
                openAddDialog
            );


        // CERRAR FORMULARIO

        document.getElementById("closeAddBtn")
            .addEventListener(
                "click",
                () => elements.addDialog.close()
            );


        document.getElementById("cancelAddBtn")
            .addEventListener(
                "click",
                () => elements.addDialog.close()
            );


        // CERRAR DETALLES

        document.getElementById("closeDetailBtn")
            .addEventListener(
                "click",
                () => elements.recipeDialog.close()
            );


        document.getElementById("detailDoneBtn")
            .addEventListener(
                "click",
                () => elements.recipeDialog.close()
            );


        // CERRAR AL HACER CLIC EN EL FONDO

        elements.addDialog.addEventListener(
            "click",
            (event) => {

                if (event.target === elements.addDialog) {

                    elements.addDialog.close();

                }

            }
        );


        elements.recipeDialog.addEventListener(
            "click",
            (event) => {

                if (event.target === elements.recipeDialog) {

                    elements.recipeDialog.close();

                }

            }
        );


        // ENVIAR FORMULARIO

        elements.recipeForm.addEventListener(
            "submit",
            addRecipe
        );

    }


    // =========================================
    // INICIAR APLICACIÓN
    // =========================================

    async function init() {


        // Registrar los eventos

        registerEvents();


        // Comprobar si Supabase está configurado

        const configured = isSupabaseConfigured();


        if (
            configured &&
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {

            const {
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            } = window.APP_CONFIG;


            // Crear conexión

            supabaseClient = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );


            demoMode = false;

        } else {

            // Utilizar modo demostración

            demoMode = true;


            if (configured && !window.supabase) {

                setConnectionStatus(
                    "No se pudo cargar Supabase. Revisá tu conexión a Internet.",
                    "error"
                );

            }

        }


       // Cargar recetas desde Supabase

        await loadRecipes();

        // Activar sincronización en tiempo real

        if (!demoMode) {

       startRealtimeSubscription();

    }
    }


    // EJECUTAR APLICACIÓN

    init();


})();