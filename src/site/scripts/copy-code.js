document.addEventListener('DOMContentLoaded', () => {
    const codeBlocks = document.querySelectorAll('.code-block-wrapper');

    codeBlocks.forEach(block => {
        const copyButton = block.querySelector('.copy-code-button');
        const codeElement = block.querySelector('pre > code');

        if (copyButton && codeElement) {
            copyButton.addEventListener('click', () => {
                const codeToCopy = codeElement.innerText;
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy code: ', err);
                    copyButton.textContent = 'Error';
                });
            });
        }
    });
});
