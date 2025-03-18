export const testController = (req, res) => {
    return res.status(200).send({
        message: "Test Routes",
        success: true,
    });
}