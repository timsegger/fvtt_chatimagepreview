/* 
 * Chat Image Preview
 */
const MODULE_ID = 'chatimagepreview';
const MODULE_NAME = 'Chat Image Preview';

/*
 * Constants
 */
const IMAGE_URL_REGEX = /https?:\/\/[^ \n]*\.(?:png|jpg|jpeg|gif|webp)(?:[?#][^ \n]*)?/gi;

const IMAGE_CLASS = 'chat-image-preview';
const IMAGE_STYLE = 'max-width: 100%; max-height: 100%; display: block; margin: 0 auto; cursor: pointer;';

/*
 * Initialization
 */
Hooks.once('ready', () => {
    /*
     * Check if libWrapper is installed and active
     */
    if (!game.modules.get('lib-wrapper')?.active) {
        log("libWrapper is not installed or not active. This module will not work without it.", 'ERROR');
        if (game.user.isGM) {
            ui.notifications.error("Module \"Chat Image Preview\" requires the 'libWrapper' module. Please install and activate it.");
        }
        return;
    }

    /*
     * Hook into ChatLog to process messages
     */
    log("Initializing Chat Image Preview");

    libWrapper.register(
        MODULE_ID,
        'ChatLog.prototype.processMessage',
        function (wrapper, message) {
            message = message.replace(IMAGE_URL_REGEX, (url, offset, string) => {
                log(`Found image URL: ${url} in message: ${string} at offset: ${offset}`);

                // Check if URL is surrounded by whitespace or at the beginning/end of the message
                if ((offset > 0 && !/\s/.test(string[offset - 1])) || (offset + url.length < string.length && !/\s/.test(string[offset + url.length]))) {
                    log('URL is not surrounded by whitespace or at the beginning/end of the message, skipping');
                    return url;
                }

                log('Replacing image URL with HTML');
                const html = `<img class="${IMAGE_CLASS}" src="${url}" style="${IMAGE_STYLE}"/>`;
                return html;
            });

            const result = wrapper(message);
            return result;
        },
        'WRAPPER',
    );

    /*
     * Handle image click events
     */
    $(document).on('click', `img.${IMAGE_CLASS}`, function (event) {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        log(`Image clicked: ${$(this).attr('src')}` + (isCtrlPressed ? ' (Ctrl pressed)' : ''));
        const imageUrl = $(this).attr('src');
        onImageClick(imageUrl, isCtrlPressed);
    });
});

/* 
 * Helper functions
 */

function log(message, level = 'LOG') {
    message = MODULE_NAME + ' | ' + message;

    switch (level) {
        case 'ERROR':
            console.error(message);
            break;
        default:
            console.log(message);
    }
}

function onImageClick(imageUrl, isCtrlPressed) {
    if (isCtrlPressed) {
        log('Ctrl pressed, opening image in new tab');
        window.open(imageUrl);
    } else {
        const imagePreview = new ImagePopout(imageUrl, { title: 'Image Preview' });
        imagePreview.render(true);
    }
}