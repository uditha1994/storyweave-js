document.addEventListener('DOMContentLoaded', function () {
    //DOM Elements
    const storiesGrid = document.getElementById('stories-grid');
    const storyView = document.getElementById('story-view');
    const backButton = document.getElementById('back-button');
    const storyTitle = document.getElementById('story-title');
    const storyContent = document.getElementById('story-content');
    const newParagraphInput = document.getElementById('new-paragraph');
    const submitParagraphBtn = document.getElementById('submit-paragraph');
    const newStoryButton = document.getElementById('new-story-button');
    const newStoryModal = document.getElementById('new-story-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const createStoryBtn = document.getElementById('create-story');
    const newStroryTitleInput = document.getElementById('new-story-title');
    const newStoryFirstParagraphInput = document.getElementById('new-story-first-paragraph');

    //state
    let currentStoryId = null;

    function loadStories() {
        // load all stories from firebase
        database.ref('stories').on('value', (snapshot) => {
            storiesGrid.innerHTML = '';
            const stories = snapshot.val() || {};

            Object.entries(stories).forEach(([id, story]) => {
                const lastParagraph = story.paragraphs
                ? Object.values(story.paragraphs)[Object.values(story.paragraphs).length - 1]
                : {text: 'No paragraph yet'};

                const storyCard = document.createElement('div');
                storyCard.className = 'story-card';
                storyCard.innerHTML = `
                    <div class="story-card-content">
                        <h3>${story.title}</h3>
                        <p>${lastParagraph.text}</p>
                    </div>
                    <div class="story-card-footer">
                        <span>${story.paragraphs ? Object.keys
                            (story.paragraphs).length : 0} Paragraphs</span>
                        <button class="like-btn" data-story-id="${id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                `;

                storiesGrid.addEventListener('click', () => viewStory(id, story));
                storiesGrid.appendChild(storyCard);
            });
        });
    }

    function viewStory(id, story) {
        //View a single Story
        currentStoryId = id;
        storyTitle.textContent = story.title;
        storyContent.innerHTML = '';

        if(story.paragraphs){
            Object.entries(story.paragraphs).forEach(([paragraphId, paragraph]) => {
                const paragraphE1 = document.createElement('div');
                paragraphE1.className = 'paragraph';
                paragraphE1.innerHTML = `
                    <p>${paragraph.text}</p>
                    <div class="paragraph-footer">
                        <button class="like-btn paragraph-like-btn" data-paragraph-id=
                        "${paragraphId}" data-story-id="${id}">
                            <i class="far fa-heart"></i>
                        </button>
                        <span class="paragraph-likes">${paragraph.likes || 0} Likes</span>
                    </div>
                `;
                storyContent.appendChild(paragraphE1);
            });
        }

        document.querySelector('.stories-container').style.display = 'none';
        storyView.style.display = 'block';

        //set up like buttons
        document.querySelectorAll('paragraph-like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
            });
        });
    }

    function createNewStory(title, firstParagraph) {
        //Create a new story
        if (!title || !firstParagraph) {
            alert('Please fill in all fields');
            return;
        }

        if (firstParagraph.length < 50) {
            alert('First paragraph must be at least 50 characters long');
            return;
        }

        const newStoryref = database.ref('stories').push();
        newStoryref.set({
            title: title,
            createAt: firebase.database.ServerValue.TIMESTAMP,
            paragraphs: {
                first: {
                    text: firstParagraph,
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    like: 0
                }
            }
        }).then(() => {
            newStoryModal.style.display = 'none';
            newStroryTitleInput.value = '';
            newStoryFirstParagraphInput.value = '';
        });
    }

    //Event Listeners
    createStoryBtn.addEventListener('click', () => {
        createNewStory(newStroryTitleInput.value, newStoryFirstParagraphInput.value);
    });

    newStoryButton.addEventListener('click', () => {
        newStoryModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        newStoryModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === newStoryModal) {
            newStoryModal.style.display = 'none';
        }
    });

    loadStories();
});