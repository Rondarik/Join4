let allAddedContacts = [];

async function contactsInit() {
    await includeHTML();
    setInitials();
}

function generateContactHTML(name, email, profileBadge, color, tel) {
    return `
    <div class="contact_info_onclick">
        <div class="contact_info_onclick_title">
            <div class="contact_info_onclick_profilebadge_layout">
                <div class="contact_info_onclick_profilebadge" style="background-color: ${color};">
                    <span>${profileBadge}</span>
                </div>
            </div>
            <div class="contact_info_onclick_name_edit">
                <div class="contact_info_onclick_name">
                    <span>${name}</span>
                </div>
                <div class="contact_info_onclick_edit_delete">
                    <div class="contact_info_onclick_edit" onclick="openEditDialog('${email}')">
                        <img class="edit_icon" src="/assets/img/edit.svg" alt="">
                        <img class="edit_hover_icon" src="/assets/img/editHover.svg" alt="">
                        <span>Edit</span>
                    </div>
                    <div class="contact_info_onclick_delete">
                        <img class="delete_icon" src="/assets/img/delete.svg" alt="">
                        <img class="delete_hover_icon" src="/assets/img/deleteHover.svg" alt="">
                        <span>Delete</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="contact_info_onclick_text">
            <span>Contact Information</span>
        </div>
        <div class="contact_info_onclick_email_phone">
            <div class="contact_info_onclick_email">
                <div class="email_text">
                    <span>Email</span>
                </div>
                <div class="email">
                    <span>${email}</span>
                </div>
            </div>
            <div class="contact_info_onclick_phone">
                <div class="phone_text">
                    <span>Phone</span>
                </div>
                <div class="phone_number">
                    <span>${tel}</span>
                </div>
            </div>
        </div>
    </div>
    `;
}


function displayContacts() {
    let contactListContainer = document.getElementById('contactListID');
    let firstLetterList = getFirstLetters();
    let contactsHTML = '';

    for (let i = 0; i < firstLetterList.length; i++) {
        const letter = firstLetterList[i];
        const headlineHTML = renderAlphabetHeadline(letter, i);
        const contactsByLetterList = filterByFirstLetter(letter);
        let contactHTML = "";
        for (let j = 0; j < contactsByLetterList.length; j++) {
            const contact = contactsByLetterList[j];
            contactHTML += renderContact(contact);
        }
        contactListContainer.innerHTML += headlineHTML + contactHTML;
    }
}


function checkIfContactIsClicked(element) {
    let contactInfoOnClick = element.querySelector('.contact_info_onclick');
    if (element.classList.contains('clicked')) {
        element.classList.remove('clicked');
        if (contactInfoOnClick) {
            contactInfoOnClick.classList.add('d_none');
            contactInfoOnClick.classList.remove('show');
        }
    } else {
        let allContactDummies = document.querySelectorAll('.contact_dummy');
        allContactDummies.forEach(dummy => {
            dummy.classList.remove('clicked');
        });
        element.classList.add('clicked');
        if (contactInfoOnClick) {
            contactInfoOnClick.classList.remove('d_none');
            contactInfoOnClick.classList.add('show');
        }
    }
}


function renderAlphabetHeadline(letter){
    return /*html*/ `
        <div class="letter">
            <div class="letter_layout">
                <span>${letter}</span>
            </div>
         </div>
        <div class="divding_line_container">
            <div class="dividing_line_contacts"></div>
        </div>
    `;
}

function filterByFirstLetter(letter) {
    return dummyContacts.filter(contact => contact.name.charAt(0).toUpperCase() === letter.toUpperCase());
}

function renderContact(contact) {
         return /*html*/ `
            <div class="contact_dummy" id="${contact.eMail}" onclick="displayContactInfo('${contact.eMail}'), checkIfContactIsClicked(this)">
                <div class="contact_dummy_border_layout">
                    <div class="contact_dummy_border" style="background-color: ${contact.color}">
                    ${getInitials(contact.name)}
                    </div>
                </div>
                <div class="contact_dummy_info_layout">
                    <div class="contact_dummy_info">
                        <span class="contact_dummy_name">${contact.name}</span>
                        <span class="contact_dummy_mail">${contact.eMail}</span>
                    </div>
                </div>
            </div>
        `;
}

function getFirstLetters() {
    let firstLetterList = [];

    for (let i = 0; i < dummyContacts.length; i++) {
        const name = dummyContacts[i].name;
        const firstLetter = name.charAt(0);
        if (!firstLetterList.includes(firstLetter)) {
            firstLetterList.push(firstLetter);
            firstLetterList.sort();
        }
    }
    return firstLetterList;
}

async function displayContactInfo(id) {
    let contactContainer = document.getElementById('contact');
    let clickedContact = await filterByFirstMail(id);
    let name = clickedContact.name;
    let email = clickedContact.eMail;
    let profileBadge = getInitials(name);
    let color = clickedContact.color;
    let tel = clickedContact.tel;

    contactContainer.innerHTML = generateContactHTML(name, email, profileBadge, color, tel);
    let contactInfoOnClick = document.querySelector('.contact_info_onclick');

    let clickedContactDummy = document.querySelector('.clicked');
    if (clickedContactDummy) {
        if (contactInfoOnClick) {
            setTimeout(() => { contactInfoOnClick.classList.add('show'); }, 50);
            contactInfoOnClick.classList.remove('d_none');
            contactInfoOnClick.style.display = 'flex';
        }
    } else {
        if (contactInfoOnClick) {
            contactInfoOnClick.classList.remove('show');
            contactInfoOnClick.classList.add('d_none');
        }
    }
}

async function filterByFirstMail(Mail) {
    return dummyContacts.find(contact => contact.eMail === Mail);
}

function openContactDialog() {
    let dialog = document.getElementById('contactDialog');
    dialog.innerHTML = '';
    dialog.innerHTML = `
        <div class="contact_dialog active">
            <div class="dialog_left_area">
                <div class="dialog_left_area_container">
                    <div class="dialog_left_area_logo_container">
                        <div class="dialog_left_area_logo">
                            <img src="/assets/img/Joinlogo.svg">
                        </div>
                    </div>
                    <div class="dialog_left_area_all_container">
                        <div class="dialog_left_area_text_container">
                            <div class="dialog_left_area_span">
                                <span>Add contact</span>
                            </div>
                            <div class="dialog_left_area_span_small">
                                <span>Tasks are better with a team!</span>
                            </div>
                        </div>   
                        <div class="dividing_line_vertical">
                        </div> 
                    </div>    
                </div>
            </div>
            <div class="profilebadge_layout">
                <div class="addcontact_profilebadge_layout">
                    <div class="addcontact_profilebadge">
                        <img src="/assets/img/person.svg" alt="">
                    </div>    
                </div>
            </div>    
            <div class="dialog_right_area">
                    <div class="dialog_right_area_close">
                        <img onclick="closeContactDialogFromButton()" src="/assets/img/close.svg">
                    </div>
                    <div class="form_container">
                        <input class="input_style person" id="addContactName" type="text" placeholder="Name">
                        <input class="input_style mail" id="addContactMail" type="text" placeholder="Email">
                        <input class="input_style phone" id="addContactPhone" type="text" placeholder="Phone">
                    </div>                      
                    <div class="form_buttons">
                        <div class="cancel_btn">
                            <button onclick="closeContactDialogFromButton()">
                                <span>Cancel</span>
                                <img class="close_icon" src="/assets/img/close.svg">
                                <img class="close_hover_icon" src="/assets/img/closeHover.svg">
                            </button>
                        </div>
                        <div class="create_contact_btn">
                            <button onclick="addContact()">
                                <span>Create contact</span>
                                <img src="/assets/img/check_white.svg">
                            </button>
                        </div>
                    </div> 
            </div>
        </div>
    `
    dialog.style.display = 'block';
    dialog.querySelector('.contact_dialog').style.left = '2800px';
    setTimeout(() => {
        dialog.querySelector('.contact_dialog').style.left = '50%';
    }, );
}

function addContact(){
    let name = document.getElementById('addContactName').value;
    let mail = document.getElementById('addContactMail').value;
    let phone = document.getElementById('addContactPhone').value;

    let addedContact = {
        'name': name,
        'mail': mail,
        'phone': phone,
    };

    allAddedContacts.push(addedContact);

    let allContactsAsString = JSON.stringify(allAddedContacts);

}


function openEditDialog(id) {
    let currentContact = dummyContacts.filter(contacts => contacts.eMail === id)[0];
    let dialog = document.getElementById('contactDialog');
    dialog.innerHTML = '';
    dialog.innerHTML = `
        <div class="contact_dialog active">
            <div class="dialog_left_area">
                <div class="dialog_left_area_container_edit">
                    <div class="dialog_left_area_logo_container">
                        <div class="dialog_left_area_logo">
                            <img src="/assets/img/Joinlogo.svg">
                        </div>
                    </div>
                    <div class="dialog_left_area_all_container_edit">
                        <div class="dialog_left_area_text_container_edit">
                            <div class="dialog_left_area_span">
                                <span>Edit contact</span>
                            </div>
                        </div>   
                        <div class="dividing_line_vertical">
                        </div> 
                    </div>    
                </div>
            </div>
            <div class="profilebadge_layout">
                <div class="addcontact_profilebadge_layout">
                    <div class="addcontact_profilebadge">
                        <img src="/assets/img/person.svg" alt="">
                    </div>    
                </div>
            </div>    
            <div class="dialog_right_area">
                    <div class="dialog_right_area_close">
                        <img onclick="closeContactDialogFromButton()" src="/assets/img/close.svg">
                    </div>
                    <div class="form_container">
                        <input class="input_style person" id="editContactName" type="text" placeholder="Name" required onchange="clearError()">
                        <input class="input_style mail" id="editContactMail" type="text" placeholder="Email" required onchange="clearError()">
                        <input class="input_style phone" id="editContactPhone" type="text" placeholder="Phone" required onchange="clearError()">
                    </div>                      
                    <div class="form_buttons_edit">
                        <div class="delete_btn">
                        <button>
                                <span>Delete</span>
                            </button>
                        </div>
                        <div class="save_btn">
                            <button>
                                <span>Save</span>
                                <img src="/assets/img/check_white.svg">
                            </button>
                        </div>
                    </div> 
            </div>
        </div>
    `
    let name = document.getElementById('editContactName');
    let mail = document.getElementById('editContactMail');
    let phone = document.getElementById('editContactPhone');
    name.value = currentContact.name;
    mail.value = currentContact.eMail;
    phone.value = currentContact.tel;
    dialog.style.display = 'block';
    dialog.querySelector('.contact_dialog').style.left = '2800px';
    setTimeout(() => {
        dialog.querySelector('.contact_dialog').style.left = '50%';
    }, );
}


function closeContactDialog(event) {
    if (event.target === document.getElementById('contactDialog')) {
        let dialog = document.getElementById('contactDialog');
        dialog.querySelector('.contact_dialog').style.left = '2800px';
        setTimeout(() => {
            dialog.querySelector('.contact_dialog').clas
        }, 400);
    }
}

function closeContactDialogFromButton() {
    let dialog = document.getElementById('contactDialog');
    dialog.querySelector('.contact_dialog').style.left = '2800px';
    setTimeout(() => {
        dialog.querySelector('.contact_dialog').classList.remove('active');
        setTimeout(() => {
            dialog.style.display = 'none';
        }, 0); 
    }, 400);
}


function getInitials(name) {
    let words = name.split(' ');
    let initials = '';
    words.forEach(word => {initials += word.charAt(0);
    });
    return initials.toUpperCase(); 
}


document.addEventListener('DOMContentLoaded', function() {
    contactsInit();
    displayContacts();
});
