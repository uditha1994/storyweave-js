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
    const imageUpload = document.getElementById('story-image-upload');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-image');
    const storyImageContainer = document.getElementById('story-image-container');

    //state
    let currentStoryId = null;
    let selectImageUrl = null;

    // image upload handler
    imageUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            //validate image size 5MB
            if (file.size > 1024 * 1024 * 5) {
                alert('Image size cannot be greater than 5MB');
                return;
            }

            //show loading state
            imagePreview.classList.add('loading');

            const reader = new FileReader();
            reader.onload = function (event) {
                selectImageUrl = event.target.result;
                previewImg.src = selectImageUrl;

                //ensure image is loaded befor show
                previewImg.onload = function () {
                    imagePreview.classList.remove('loading');
                    imagePreview.style.display = 'block';

                    if (this.naturalHeight > this.naturalWidth) {
                        this.style.objectPosition = 'center top';
                    } else {
                        this.style.objectPosition = 'center center'
                    }
                };

                previewImg.onerror = function () {
                    imagePreview.classList.remove('loading');
                    alert("Error loading image, try again");
                };
            };
            reader.readAsDataURL(file);
        }

    });

    function loadStories() {
        // load all stories from firebase
        database.ref('stories').on('value', (snapshot) => {
            storiesGrid.innerHTML = '';
            const stories = snapshot.val() || {};

            Object.entries(stories).forEach(([id, story]) => {
                const lastParagraph = story.paragraphs
                    ? Object.values(story.paragraphs)[Object.values(story.paragraphs).length - 1]
                    : { text: 'No paragraph yet' };

                const storyCard = document.createElement('div');
                storyCard.className = 'story-card';
                storyCard.innerHTML = `
                    ${story.coverImage ?
                        `<div class="story-card-image-container">
                            <img src="${story.coverImage}" 
                            class="story-card-image" alt="${story.title}">
                        </div>` : ``}
                    <div class="story-card-content">
                        <h3>${story.title}</h3>
                        <p>${lastParagraph.text}</p>
                    </div>
                    <div class="story-card-footer">
                        <span>${story.paragraphs ? Object.keys
                        (story.paragraphs).length : 0} Paragraphs &nbsp;</span>
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

        if (story.coverImage) {
            storyImageContainer.innerHTML = `
                <img class="${story.coverImage}" class="story-image" 
                alt="${story.title}">
            `;
            storyImageContainer.style.display = 'block';

            const img = storyImageContainer.querySelector('img');
            img.onload = function () {
                if (this.naturalHeight > this.naturalWidth) {
                    this.style.objectPosition = 'center top';
                } else {
                    this.style.objectPosition = 'center center';
                }
            };
        } else {
            storyImageContainer.style.display = 'none';
        }

        if (story.paragraphs) {
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
                likeParagraph(btn.dataset.storyId, btn.dataset.paragraphId);
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

        if (!selectImageUrl) {
            alert('Please select a cover image');
            return;
        }

        const newStoryref = database.ref('stories').push();
        newStoryref.set({
            title: title,
            coverImage: selectImageUrl,
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
            selectImageUrl = null;
            imagePreview.style.display = 'none';

            viewStory(newStoryref.id, {
                title: title,
                coverImage: selectImageUrl,
                paragraphs: {
                    first: {
                        text: firstParagraph,
                        likes: 0
                    }
                }
            });
        });
    }

    //like a story
    function likeStory(storyId) {
        const storyref = database.ref(`stories/${storyId}/likes`);
        storyref.transaction((currentLikes) => {
            return (currentLikes || 0) + 1;
        });
    }

    //like a paragraph
    function likeParagraph(storyId, paragraphId) {
        const paragraphref = database.ref(`stories/${storyId}/
            paragraphs/${paragraphId}/likes`);
        paragraphref.transaction((currentLikes) => {
            return (currentLikes || 0) + 1;
        });
    }

    //Add a new paragraph to a story
    function addParagraph(storyId, text) {
        if (text.length < 50) {
            alert('Paragraph must be at least 50 characters long');
            return;
        }

        const newParagraphRefs = database.ref(`stories/${storyId}/
            paragraphs`).push();
        newParagraphRefs.set({
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            likes: 0
        });
        newParagraphInput.value = '';
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

    backButton.addEventListener('click', ()=>{
        storyView.style.display = 'none';
        document.querySelector('.stories-container').style.display = 'block';
        currentStoryId = null;
    });

    

    window.addEventListener('click', (e) => {
        if (e.target === newStoryModal) {
            newStoryModal.style.display = 'none';
        }
    });

    loadStories();
});