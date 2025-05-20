document.addEventListener('DOMContentLoaded', function () {
    //DOM Elements
    const storiesGrid = document.getElementById('stories-grid');
    const storyView = document.getElementById('story-view');
    const backButton = document.getElementById('back-button');
    const storyTitle = document.getElementById('story-title');
    const storyContent = document.getElementById('story-content');
    const newParagraphInput = document.getElementById('new-paragraph');
    const submitParagraphBtn = document.getElementById('new-story-button');
    const newStoryModal = document.getElementById('new-story-modal');
    const closeModalBtn = document.getElementById('.close-modal');
    const createStoryBtn = document.getElementById('create-story');
    const newStroryTitleInput = document.getElementById('new-story-title');
    const newStoryFirstParagraphInput = document.getElementById('new-story-first-paragraph');

    //state
    let currentStoryId = null;

    function loadStories() {
        // load all stories from firebase
    }

    function viewStory(id, story) {
        //View a single Story
    }

    function createNewStory(title, firstParagraph) {
        //Create a new story
        if (!title || !firstParagraph) {
            alert('Please fill in all fields');
            return;
        }

        if(firstParagraph.length < 50){
            alert('First paragraph must be at least 50 characters long');
            return;
        }

        const newStoryref = database.ref('stories').push();
        newStoryref.set({
            title: title,
            createAt: firebaseConfig.database.ServerValue.TIMESTAMP,
            paragraphs: {
                first:{
                    text: firstParagraph,
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    like:0
                }
            }
        });
    }

    //Event Listeners
    createStoryBtn.addEventListener('click', ()=>{
        createNewStory(newStroryTitleInput.value, newStoryFirstParagraphInput.value);
    });

});