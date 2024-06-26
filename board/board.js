let currentDraggedElement;
/**
 * Initializes the board by including HTML, fetching tasks from the server, updating the HTML, and setting initial values.
 *
 * @return {Promise<void>} A promise that resolves when the board initialization is complete.
 */
async function boardInit(){
    await includeHTML();
    await getAllTasksFromServer();
    await getAllContactsFromServer();
    updateHTML();
    setInitials();
    showCategory();
    checkEmptyDone();
    checkEmptyToDo();
    checkEmptyProgress();
    checkEmptyAwaitFeedback();
}

/**
 * Shows the add task overlay by removing the 'd-none' class from the 'addTaskOverlayID' element.
 *
 * @param {type} paramName - description of parameter
 * @return {type} description of return value
 */
function showAddTaskOverlay(status){
    document.getElementById('addTaskOverlayID').classList.remove('d-none');
    globalenStatus=status;
    clearTaskForm();
}

/**
 * Closes the add task overlay by adding a 'd-none' class to the element with the ID 'addTaskOverlayID'.
 *
 * @return {void} 
 */
function closeAddTaskOverlay(){
    document.getElementById('contact_to_assign_containerID').classList.add('d-none');
    document.getElementById('addTaskOverlayID').classList.add('d-none');
}


function doNotClose(event) {
    event.stopPropagation();
}

/**
 * Updates the HTML of the page by rendering the tasks based on their processing status.
 *
 * @return {void} This function does not return anything.
 */
function updateHTML() {
    const statuses = ['ToDo', 'progress', 'awaitFeedback', 'done'];
    for (let i = 0; i < statuses.length; i++) {
        const status = statuses[i];
        const tasks = allTasks.filter(task => task['processingStatus'] === status);
        const container = document.getElementById(status.toLowerCase());
        container.innerHTML = '';
        for (let j = 0; j < tasks.length; j++) {
            container.innerHTML += generateTodoHTML(tasks[j]);
        }
    }
}

/**
 * Sets the currentDraggedElement to the provided taskID.
 *
 * @param {number} taskID - The ID of the task being dragged.
 */
function startDragging(taskID){
    currentDraggedElement=taskID;
}

/**
 * Calculates the progress value based on the completed subtasks and total subtasks.
 *
 * @param {Array} subtasks - The list of subtasks to calculate progress from.
 * @return {Object} An object containing the progress value, completed subtasks count, and total subtasks count.
 */
function calculateProgress(subtasks) {
    let progressValue = 0;
    let completedSubtasks = 0;
    let totalSubtasks = 0;
    if (subtasks) {
        totalSubtasks = subtasks.length;
        completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
        if (totalSubtasks > 0) {
            progressValue = (completedSubtasks / totalSubtasks) * 100;
        }
    }
    return { progressValue, completedSubtasks, totalSubtasks }; 
}

/**
 * Generates the HTML for a todo item based on the given element.
 *
 * @param {Object} element - The element object containing the task details.
 * @return {string} The generated HTML for the todo item.
 */
function generateTodoHTML(element) {
    let id = element['taskID'];
    let categoryColor = '';
    if (element['category'] === 'User Story') {
        categoryColor = '#0038FF';
    } else if (element['category'] === 'Technical Task') {
        categoryColor = '#1FD7C1';
    }
    let subtaskHTML = ''; 
    let { completedSubtasks, totalSubtasks } = calculateProgress(element['subtasks']); // Calculate progress

    let progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    if (totalSubtasks > 0) {
        subtaskHTML = `
            <div class="progress_container">
                <progress id="progress_${id}" class="progressbar" max="100" value="${progressPercentage}">${progressPercentage}%</progress>
                <p class="progress_text">${completedSubtasks}/${totalSubtasks} Subtasks</p>
            </div>`;
    }
    return `<div id="tasks_card_${element['taskID']}" onclick="openBigTask(${id})" class="task_progress" draggable="true" ondragstart="startDragging(${element['taskID']})">
        <div>
            <span class="progress_title" style="background-color: ${categoryColor};">${element['category']}</span>
            <div class="progress_text">
                <p class="text_headline">${element['title']}</p>
                <p class="text_description">${element['description']}</p>
            </div>
            ${subtaskHTML} 
            <div class="contacts_container">
                <div class="small_card_users_area">` +
                getAssignedToIconsHTML(element['assignedTo']) +
                /*html*/ `
                </div>
                <img class="prio_img" src="${element['prio'][0]}" alt="">
            </div>
        </div>
    </div>`;
}


/**
 * Generates the HTML for the assigned contacts icons based on the provided contacts array.
 *
 * @param {Array} contacts - The array of contacts for which icons are to be generated.
 * @return {string} The HTML string containing the assigned contacts icons.
 */
function getAssignedToIconsHTML(contacts) {
    let html = /*html*/ `<div class="overlapped_contact_icons">`;
    let shift = 0;
    
    contacts.forEach(contact => {
        let initials = makeInitials(contact.name);
        html += /*html*/ `<div class='contacts_icon' style="background-color: ${contact.color};">${initials}</div>`;
        shift -= 10;
    });
    html += /*html*/`</div>`;
    return html;
}

/**
 * Prevents the default behavior of the drop event.
 *
 * @param {Event} ev - The drop event object.
 * @return {void} This function does not return a value.
 */
function allowDrop(ev) {
    ev.preventDefault();
}
/**
 * Moves a task to a new processing status.
 *
 * @param {string} processingStatus - The new processing status for the task.
 * @return {Promise<void>} - A promise that resolves when the task has been moved and the HTML has been updated.
 */
async function moveTo(processingStatus) {
    let currendTask = allTasks.find(task => task.taskID === currentDraggedElement);
    if (currentDraggedElement !== undefined && currendTask !== undefined) {
        currendTask['processingStatus'] = processingStatus;
        updateHTML();
        await setItem('allTasks', JSON.stringify(allTasks));
        checkEmptyToDo();
        checkEmptyDone();
        checkEmptyProgress();
        checkEmptyAwaitFeedback();
        removeHighlight('awaitfeedback');
        removeHighlight('done');
        removeHighlight('progress');
        removeHighlight('todo');
    } else {
        console.error("Invalid task ID or task does not exist.");
    }
}

function highlight(id) {
    document.getElementById(id).classList.add('drag_area_highlight');
}
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag_area_highlight');
}


/**
 * Checks if the specified column is empty and adds a message if it is.
 *
 * @param {string} columnId - The ID of the column element.
 * @param {string} message - The message to be added if the column is empty.
 * @return {void} This function does not return a value.
 */
function checkEmptyColumn(columnId, message) {
    let column = document.getElementById(columnId);
    if (column.innerHTML.trim() === '') {
        column.innerHTML = `<div class="task_todo">${message}</div>`;
    }
}

function checkEmptyToDo() {
    checkEmptyColumn('todo', 'No tasks to do');
}

function checkEmptyProgress() {
    checkEmptyColumn('progress', 'No tasks in Progress');
}

function checkEmptyAwaitFeedback() {
    checkEmptyColumn('awaitfeedback', 'No tasks in Await Feedback');
}

function checkEmptyDone() {
    checkEmptyColumn('done', 'No tasks Done');
}

/**
 * Opens the big task with the given ID by removing the 'd-none' class from the 'bigTask' element,
 * adding the 'show' class to the 'bigTask' element, and setting the innerHTML of the 'bigTask' element
 * to the result of the 'showBigTask' function with the task from 'allTasks' array that matches the given ID.
 *
 * @param {number} id - The ID of the task to be opened.
 * @return {void} This function does not return a value.
 */
function openBigTask(id){
    for (let i=0; i<allTasks.length; i++){
            const task=allTasks[i]['taskID'];
    if (task==id) {
        document.getElementById('bigTask').classList.remove('d-none');
        document.getElementById('bigTask').classList.add('show');
        let bigTask = document.getElementById('bigTask');
        bigTask.innerHTML = showBigTask(allTasks[i]);
    } 
}
}

/**
 * Closes the big task by adding the 'd-none' class to the 'bigTask' element.
 *
 * @param {none} none - This function does not take any parameters.
 * @return {none} This function does not return any value.
 */
function closeBigTask(){
    document.getElementById('bigTask').classList.add('d-none');
   
}

/**
 * Generates the HTML markup for displaying a big task element.
 *
 * @param {Object} element - The task element to display.
 * @return {string} The HTML markup for the big task element.
 */
function showBigTask(element){
    let id = element['taskID'];
    let categoryColor = '';
    let BigTaskHTML = '';
    if(element['category'] === 'User Story') {
        categoryColor = '#0038FF';
    } else if(element['category'] === 'Technical Task') {
        categoryColor = '#1FD7C1'; 
    }

    let subtasksHTML = ''; 
    if (element['subtasks'] && element['subtasks'].length > 0) {
        subtasksHTML += '<h3 class="h3">Subtasks</h3>';
        for (let i = 0; i < element['subtasks'].length; i++) {
            const checked = element['subtasks'][i].completed ? 'checked' : ''; // Determine if subtask is checked
            subtasksHTML += `
                <div class="bigSubtasksContainer">
                <img  onclick="toggleSubtask(${id},${i})" id="checkbox_${id}_${i}" src="../assets/img/${checked ? 'checkboxOn' : 'checkboxOff'}.svg" alt="" style="cursor:pointer;">
                <p class="bigInfosContacts">${element['subtasks'][i].name}</p>
                </div>`;
        }
    }
    BigTaskHTML = makeBigTaskHTML(element, categoryColor, subtasksHTML, id);
    return BigTaskHTML;
}

/**
 * Toggles the completion status of a subtask and updates the progress of the task.
 *
 * @param {number} taskID - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @return {void} This function does not return a value.
 */
function toggleSubtask(taskID, subtaskIndex) {
    const task = allTasks.find(task => task.taskID === taskID);
    if (task && task.subtasks && task.subtasks[subtaskIndex]) {
        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
        const checkbox = document.getElementById(`checkbox_${taskID}_${subtaskIndex}`);
        checkbox.src = `../assets/img/${task.subtasks[subtaskIndex].completed ? 'checkboxOn' : 'checkboxOff'}.svg`;
        
        task.completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;

        updateProgress(taskID);
        const subtasksDisplay = document.getElementById(`subtasks_${taskID}`);
        if (subtasksDisplay) {
            subtasksDisplay.textContent = `${task.completedSubtasks}/${task.subtasks.length} Subtasks`;
        }
    }
}

/**
 * Updates the progress of a task.
 *
 * @param {number} taskID - The ID of the task.
 * @return {Promise<void>} A promise that resolves when the progress is updated.
 */
async function updateProgress(taskID) {
    const task = allTasks.find(task => task.taskID === taskID);
    if (task) {
        const { progressValue, completedSubtasks, totalSubtasks } = calculateProgress(task.subtasks);
        const progressBar = document.getElementById(`progress_${taskID}`);
        progressBar.value = progressValue;
        progressBar.innerText = `${progressValue}%`;
        const progressText = document.querySelector(`#progress_${taskID} + .progress_text`);
        if (progressText) {
            progressText.innerText = `${completedSubtasks}/${totalSubtasks} Subtasks`;
        }
    }
    await setItem('allTasks', JSON.stringify(allTasks));
}

/**
 * Generates the HTML for the contact information displayed in the big card.
 *
 * @param {Object} contact - The contact object containing the name and logo.
 * @return {string} The HTML string representing the contact information.
 */
function getContactForBigCardHTML(contact) {
    return (
      /*html*/ `
        <div class='bigTaskAssignedTo'>` +
      getContactLogoHTML(contact) +
      /*html*/ `  
          <div>${contact.name}</div>
          </div>`
    );
}

/**
 * Generates the HTML for the assigned contacts based on the provided contacts array.
 *
 * @param {Array} contacts - The array of contacts for which HTML is to be generated.
 * @return {string} The HTML string representing the assigned contacts.
 */
function getAssignedToHTML(contacts) {
    let html = "";
    contacts.forEach((contact) => (html += getContactForBigCardHTML(contact)));
    return html;
}

/**
 * Generates the HTML for the contact logo based on the provided contact object.
 *
 * @param {Object} contact - The contact object containing the name and color.
 * @return {string} The HTML string representing the contact logo.
 */
function getContactLogoHTML(contact) {
    return /*html*/ `
        <div class='contacts_icon' style="background-color: ${contact.color}">${makeInitials(contact.name)}</div>
      `;
}

/**
 * Finds tasks based on the search input and updates the corresponding HTML elements.
 *
 * @return {void} This function does not return anything.
 */  
function findTaskFunction() {
    let search = document.getElementById('search').value.toLowerCase();
    let searchArray = [];
    document.getElementById('todo').innerHTML = '';
    document.getElementById('progress').innerHTML = '';
    document.getElementById('awaitfeedback').innerHTML = '';
    document.getElementById('done').innerHTML = '';
    for (let i = 0; i < allTasks.length; i++) {
        const element = allTasks[i];
        if (element['title'].toLowerCase().includes(search) || element['description'].toLowerCase().includes(search)) {
            searchArray.push(element);
        }
    }
    for (let index = 0; index < searchArray.length; index++) {
        const element = searchArray[index];
        if (element['processingStatus'] === 'ToDo') {
            document.getElementById('todo').innerHTML += generateTodoHTML(element);
        } else if (element['processingStatus'] === 'progress') {
            document.getElementById('progress').innerHTML += generateTodoHTML(element);
        } else if (element['processingStatus'] === 'awaitFeedback') {
            document.getElementById('awaitfeedback').innerHTML += generateTodoHTML(element);
        } else if (element['processingStatus'] === 'done') {
            document.getElementById('done').innerHTML += generateTodoHTML(element);
        }
    }
}

/**
 * Filters all tasks by a specific status and returns the number of tasks with that status.
 *
 * @param {string} status - The processing status to filter tasks by.
 * @return {number} The number of tasks with the specified status.
 */
function countTasksByStatus(status) {
    return allTasks.filter(task => task.processingStatus === status).length;
}

/**
 * Counts the number of tasks in the `allTasks` array that have the specified priority.
 *
 * @param {string} priority - The priority to filter tasks by.
 * @return {number} The number of tasks with the specified priority.
 */
function countTasksByPriority(priority) {
    return allTasks.filter(task => task.prio.includes(priority)).length;
}

/**
 * Retrieves the most urgent task from the list of all tasks.
 *
 * @return {Object|undefined} The most urgent task object, or undefined if no urgent tasks exist.
 */
function getUrgentTask() {
    const urgentTasks = allTasks.filter(task => task.prio.includes('Urgent'));
    if (urgentTasks.length > 0) {
        return urgentTasks.reduce((earliestTask, currentTask) => {
            const earliestDueDate = new Date(earliestTask.dueDate);
            const currentDueDate = new Date(currentTask.dueDate);
            return earliestDueDate < currentDueDate ? earliestTask : currentTask;
        });
    } else {
        return undefined;
    }
}

/**
 * Löscht eine Aufgabe mit der angegebenen taskID aus dem allTasks-Array,
 * aktualisiert das HTML, ordnet die IDs neu und speichert das aktualisierte allTasks-Array im lokalen Speicher.
 *
 * @param {number} taskID - Die ID der zu löschenden Aufgabe.
 * @return {Promise<void>} Ein Promise, das auflöst, wenn die Aufgabe gelöscht und der lokale Speicher aktualisiert wurde.
 */
async function deleteTasks(taskID) {
    const index = allTasks.findIndex(task => task.taskID === taskID);
    if (index !== -1) {
        allTasks.splice(index, 1);
        updateHTML();
        await setItem('allTasks', JSON.stringify(allTasks));
    } 
    closeBigTask();
}

/**
 * Opens a popup with the provided content.
 *
 * @param {string} content - The HTML content to be displayed in the popup.
 * @return {void} This function does not return a value.
 */
function openPopup(content,prio) {
    const editPopup = document.getElementById('editTaskOverlay');
    editPopup.innerHTML = content;
    renderNewSubtask();
    renderUserTag();
    editPopup.classList.remove('d-none');
    setTaskPrio(prio[1]);
}

/**
 * Closes the popup by clearing its content and hiding it.
 *
 * @return {void} This function does not return a value.
 */
function closePopup() {
    const editPopup = document.getElementById('editTaskOverlay');
    editPopup.innerHTML = '';
    editPopup.classList.add('d-none');
}

/**
 * fetches the transferred contacts from the list of all contacts based on the email
 * 
 * @param {object} contacts - assigned contacts
 * @returns
 */
function getAssignedContacts(contacts) {
    let contactList = [];
    for (let i = 0; i < contacts.length; i++) {
        const element = contacts[i];
        contactList.push(dummyContacts.find(contact => contact.eMail === element.eMail));
    }
    return contactList;
}

/**
 * Saves the edited task with the given taskID by updating the task details in the allTasks array,
 * updating the HTML, closing the popup, and saving the updated allTasks array to local storage.
 *
 * @param {number} taskID - The ID of the task to be edited.
 * @return {void} This function does not return a value.
 */
function saveEditedTask(taskID) {
    const editedTaskIndex = allTasks.findIndex(task => task.taskID ==taskID);
    if (editedTaskIndex !== -1) {
        const editedTask = allTasks[editedTaskIndex];
        editedTask.title = document.getElementById('taskTitle').value;
        editedTask.description = document.getElementById('taskDiscription').value;
        editedTask.dueDate = document.getElementById('dueDate').value;
        editedTask.assignedTo = assignedContacts;
        editedTask.prio = taskPrio;
        editedTask.subtasks = subtasks;
        allTasks[editedTaskIndex] = editedTask;
        setItem('allTasks', JSON.stringify(allTasks));
        updateHTML();
        document.getElementById('bigTask').innerHTML = showBigTask(editedTask);
    }
    closePopup();
}