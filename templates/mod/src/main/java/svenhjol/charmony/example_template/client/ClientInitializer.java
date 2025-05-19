package svenhjol.charmony.example_template.client;

import net.fabricmc.api.ClientModInitializer;
import svenhjol.charmony.core.enums.Side;

public final class ClientInitializer implements ClientModInitializer {
    @Override
    public void onInitializeClient() {
        // Ensure charmony is launched first.
        svenhjol.charmony.core.client.ClientInitializer.init();

        // Prepare and run the mod.
        var mod = ExampleTemplateMod.instance();
        mod.run(Side.Client);
    }
}
