document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const deleteAllButton = document.getElementById('delete-all'); 

    loadTodos();
    
    todoForm.addEventListener('submit', (block) => {
        block.preventDefault();
        const task = todoInput.value.trim();
        if (task) {
            const startTime = new Date().toLocaleString();
            addTodoItem(task, startTime);
            todoInput.value = '';
            saveTodos();
        }
        updateTaskCounts();
    });

    // Add event listener for "Delete All" button
    deleteAllButton.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn xóa hết các công việc ?')) {
            todoList.innerHTML = ''; // Clear all <li> elements
            localStorage.removeItem('todos');
            updateTaskCounts(); // Remove all tasks from localStorage
        }
    });

    function addTodoItem(task, startTime, endTime = null, completed = false) {
        const li = document.createElement('li');
    
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task';
        taskDiv.textContent = task;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'time';
        timeDiv.innerHTML = `Start: ${startTime}` + (endTime ? `<br>End: ${endTime}` : '');
    
        if (completed) {
            taskDiv.style.textDecoration = 'line-through';
        }
    
        // Thêm các nút điều khiển vào công việc
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';

        // Nút hoàn thành công việc
        const completeButton = document.createElement('button');
        completeButton.className = 'complete';
        completeButton.textContent = completed ? 'Hoàn Tác' : 'Đã Xong';

        // Xử lý sự kiện khi nhấn nút hoàn thành
        completeButton.addEventListener('click', () => {
            const isCompleted = taskDiv.style.textDecoration === 'line-through';

            if (isCompleted) {
                // Nếu công việc đã hoàn thành, chuyển về trạng thái chưa hoàn thành
                taskDiv.style.textDecoration = 'none';
                timeDiv.innerHTML = `Start: ${startTime}<br>`;
                completeButton.textContent = 'Đã Xong';


                li.classList.remove('completed');
                li.classList.add('pending');
                
                // Cập nhật trạng thái chưa hoàn thành trong localStorage
                updateTodoInLocalStorage(taskDiv.textContent, startTime, null, false);
            } else {
                // Nếu công việc chưa hoàn thành, đánh dấu là hoàn thành
                taskDiv.style.textDecoration = 'line-through';
                const endTime = new Date().toLocaleString();
                timeDiv.innerHTML = `Start: ${startTime}<br>End: ${endTime}`;
                completeButton.textContent = 'Hoàn Tác';


                li.classList.remove('pending');
                li.classList.add('completed');

                // Cập nhật trạng thái hoàn thành trong localStorage
                updateTodoInLocalStorage(taskDiv.textContent, startTime, endTime, true);
            }

            // Cập nhật lại số đếm và lưu vào localStorage
            saveTodos();
            updateTaskCounts();
        });

    
        const editButton = document.createElement('button');
        editButton.textContent = 'Sửa';
        editButton.className = 'edit';
        editButton.addEventListener('click', () => {
            const newTask = prompt('Edit your task:', taskDiv.textContent);
            if (newTask !== null && newTask.trim() !== '') {
                taskDiv.textContent = newTask.trim();
                
                // Cập nhật startTime thành thời gian sửa mới
                const newStartTime = new Date().toLocaleString();
                startTime = newStartTime; // Cập nhật thời gian bắt đầu mới
                timeDiv.innerHTML = `Sửa: ${newStartTime}`;
                taskDiv.style.textDecoration = 'none';
                updateTodoInLocalStorage(newTask.trim(), newStartTime, null, false);
            }
            updateTaskCounts();
            saveTodos();
        });
    
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Xóa';
        deleteButton.className = 'delete';
    
        // Sự kiện khi nhấn nút Xóa
        deleteButton.addEventListener('click', () => {
            // Xóa công việc khỏi giao diện
            todoList.removeChild(li); // Xóa <li> của công việc khỏi danh sách
    
            // Xóa công việc khỏi localStorage
            removeTodoFromLocalStorage(task);
    
            // Cập nhật lại số đếm công việc sau khi xóa
            saveTodos();
            updateTaskCounts(); // Cập nhật lại số lượng công việc đã hoàn thành và chưa hoàn thành
    
            // Lưu lại danh sách công việc còn lại vào localStorage
            
        });
    
        buttonsDiv.appendChild(completeButton);
        buttonsDiv.appendChild(editButton);
        buttonsDiv.appendChild(deleteButton);
        li.appendChild(taskDiv);
        li.appendChild(timeDiv);
        li.appendChild(buttonsDiv);
        todoList.appendChild(li);
        todoList.insertBefore(li, todoList.firstChild);
    }
    
    function updateTaskCounts() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        if (todos.length === 0) {
            // Nếu không có công việc nào, đặt tất cả đếm về 0
            document.getElementById('completed-count').textContent = 'Hoàn Thành: 0';
            document.getElementById('pending-count').textContent = 'Chưa Hoàn Thành: 0';
            document.getElementById('sum-count').textContent = 'Tổng Công việc: 0';
            return;
        }
        const completedCount = todos.filter(todo => todo.completed).length;
        const pendingCount = todos.length - completedCount;
    
        document.getElementById('completed-count').textContent = `Hoàn Thành: ${completedCount}`;
        document.getElementById('pending-count').textContent = `Chưa Hoàn Thành: ${pendingCount}`;
        document.getElementById('sum-count').textContent = `Tổng Công việc: ${todos.length}`;
    }
    
    function saveTodos() {
        const todos = [];
        todoList.querySelectorAll('li').forEach(li => {
            const taskDiv = li.querySelector('.task');
            const timeDiv = li.querySelector('.time');
            const [start, end] = timeDiv.innerHTML.split('<br>').map(line => line.split(': ')[1]);
            todos.push({ 
                task: taskDiv.textContent, 
                startTime: start, 
                endTime: end || null, 
                completed: taskDiv.style.textDecoration === 'line-through' 
            });
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    function updateTodoInLocalStorage(task, startTime, endTime, completed) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const updatedTodos = todos.map(todo => {
            // Cập nhật công việc dựa trên nội dung và thời gian bắt đầu
            if (todo.task === task && todo.startTime === startTime) {
                return { task, startTime, endTime, completed };
            }
            return todo;
        });
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }
    
    
    function removeTodoFromLocalStorage(task) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const updatedTodos = todos.filter(todo => todo.task !== task); // Lọc công việc cần xóa
        localStorage.setItem('todos', JSON.stringify(updatedTodos)); // Lưu lại danh sách đã cập nhật
    }

    function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.reverse().forEach(todo => addTodoItem(todo.task, todo.startTime, todo.endTime, todo.completed));
    updateTaskCounts();
    }

});

